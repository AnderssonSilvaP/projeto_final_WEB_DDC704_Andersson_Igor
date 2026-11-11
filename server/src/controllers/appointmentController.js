const Appointment = require('../models/Appointment');
const FinancialTransaction = require('../models/FinancialTransaction');
const Patient = require('../models/Patient');
const {
  pick,
  newReceiptNumber,
  enumValues,
  isValidId,
  checkId,
  sendNotFound,
  sendBadRequest,
} = require('./shared');

const NOT_FOUND = 'Consulta não encontrada';
const CREATE_FIELDS = [
  'patient', 'dentist', 'chairNumber', 'date', 'timeSlot', 'procedure',
  'category', 'durationMinutes', 'price', 'notes',
];
const UPDATE_FIELDS = [
  ...CREATE_FIELDS, 'status', 'paid', 'paymentMethod',
];
const INACTIVE_STATUSES = ['cancelado', 'falta'];
const RECALL_INTERVAL_MS = 180 * 24 * 60 * 60 * 1000;

const refId = (value) => (value && typeof value === 'object' && value._id ? String(value._id) : value);

const readFields = (body, fields) => {
  const data = pick(body, fields);
  if (data.patient !== undefined) data.patient = refId(data.patient);
  if (data.dentist !== undefined) data.dentist = refId(data.dentist);
  return data;
};

const populateAppointment = (query) =>
  query
    .populate('patient', 'name phone cpf eloScore chessRank')
    .populate('dentist', 'name specialty cro avatar');

// Returns an error message when the chair or the dentist is already booked at that slot.
const findConflict = async ({ date, timeSlot, chairNumber, dentist, excludeId }) => {
  const base = { date, timeSlot, status: { $nin: INACTIVE_STATUSES } };
  if (excludeId) base._id = { $ne: excludeId };

  if (chairNumber && (await Appointment.exists({ ...base, chairNumber }))) {
    return `A cadeira #${chairNumber} já possui um agendamento às ${timeSlot} na data informada.`;
  }
  if (dentist && (await Appointment.exists({ ...base, dentist }))) {
    return `O dentista já possui outro procedimento agendado para as ${timeSlot}.`;
  }
  return null;
};

const getAppointments = async (req, res, next) => {
  try {
    const { date, dentist, chair, status } = req.query;
    const query = {};

    if (date) query.date = String(date);
    if (dentist) {
      if (!isValidId(dentist)) return sendBadRequest(res, 'Dentista inválido');
      query.dentist = dentist;
    }
    if (chair) query.chairNumber = Number(chair);
    if (status) query.status = String(status);

    const appointments = await populateAppointment(Appointment.find(query)).sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

const getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await populateAppointment(Appointment.find({ date: today })).sort({ timeSlot: 1 });

    res.json({ success: true, count: appointments.length, date: today, appointments });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const data = readFields(req.body, CREATE_FIELDS);
    if (!isValidId(data.patient) || !isValidId(data.dentist)) {
      return sendBadRequest(res, 'Paciente e dentista válidos são obrigatórios.');
    }
    data.chairNumber = data.chairNumber || 1;

    const conflict = await findConflict(data);
    if (conflict) return sendBadRequest(res, conflict);

    const appointment = await Appointment.create({ ...data, status: 'agendado' });
    const populated = await populateAppointment(Appointment.findById(appointment._id));

    res.status(201).json({
      success: true,
      message: 'Consulta agendada com sucesso.',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const { status, paymentMethod, paid } = req.body;
    if (!enumValues(Appointment, 'status').includes(status)) {
      return sendBadRequest(res, 'Status inválido.');
    }

    const appointment = await Appointment.findById(req.params.id).populate('patient').populate('dentist');
    if (!appointment) return sendNotFound(res, NOT_FOUND);

    const wasCompleted = appointment.status === 'concluido';
    appointment.status = status;

    if (status === 'aguardando') {
      appointment.waitingRoomArrivedAt = new Date();
    } else if (status === 'em_atendimento') {
      appointment.serviceStartedAt = new Date();
    } else if (status === 'concluido') {
      appointment.serviceFinishedAt = new Date();
      if (paid !== undefined) appointment.paid = Boolean(paid);
      if (paymentMethod) appointment.paymentMethod = paymentMethod;
    }

    await appointment.save();

    if (status === 'concluido' && !wasCompleted) {
      await Patient.findByIdAndUpdate(appointment.patient._id, {
        lastVisit: new Date(),
        nextRecallDate: new Date(Date.now() + RECALL_INTERVAL_MS),
        $inc: { eloScore: 25 },
      });

      if (appointment.paid) {
        const rate = appointment.dentist.commissionRate || 50;
        await FinancialTransaction.create({
          type: 'receita',
          category: 'consulta',
          description: `Procedimento: ${appointment.procedure} - Paciente: ${appointment.patient.name}`,
          amount: appointment.price,
          paymentMethod: appointment.paymentMethod === 'pendente' ? 'pix' : appointment.paymentMethod,
          status: 'pago',
          patient: appointment.patient._id,
          dentist: appointment.dentist._id,
          commission: {
            dentist: appointment.dentist._id,
            percentage: rate,
            amount: (appointment.price * rate) / 100,
            isPaid: false,
          },
          receiptNumber: newReceiptNumber(),
        });
      }
    }

    res.json({
      success: true,
      message: `Status da consulta alterado para: '${status}'.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const current = await Appointment.findById(req.params.id);
    if (!current) return sendNotFound(res, NOT_FOUND);

    const changes = readFields(req.body, UPDATE_FIELDS);
    const merged = { ...current.toObject(), ...changes };

    const reschedules = ['date', 'timeSlot', 'chairNumber', 'dentist'].some((f) => changes[f] !== undefined);
    if (reschedules && !INACTIVE_STATUSES.includes(merged.status)) {
      const conflict = await findConflict({
        date: merged.date,
        timeSlot: merged.timeSlot,
        chairNumber: merged.chairNumber,
        dentist: merged.dentist,
        excludeId: current._id,
      });
      if (conflict) return sendBadRequest(res, conflict);
    }

    current.set(changes);
    await current.save();
    const appointment = await populateAppointment(Appointment.findById(current._id));

    res.json({
      success: true,
      message: 'Consulta atualizada com sucesso.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    if (!checkId(res, req.params.id, NOT_FOUND)) return;

    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return sendNotFound(res, NOT_FOUND);

    res.json({ success: true, message: 'Consulta removida da agenda.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getTodayAppointments,
  createAppointment,
  updateStatus,
  updateAppointment,
  deleteAppointment,
};
