const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const { pick, checkId, isValidId } = require('./shared');

const FIELDS = ['patient', 'service', 'dentistName', 'date', 'timeSlot', 'status', 'notes'];

async function hasConflict({ date, timeSlot, dentistName, excludeId }) {
  const filter = {
    date,
    timeSlot,
    dentistName,
    status: { $ne: 'cancelado' },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Boolean(await Appointment.findOne(filter));
}

async function getAppointments(req, res, next) {
  try {
    const { date, status, dentistName } = req.query;
    const query = {};
    if (typeof date === 'string' && date) query.date = date;
    if (typeof status === 'string' && status && status !== 'todos') query.status = status;
    if (typeof dentistName === 'string' && dentistName && dentistName !== 'todos') {
      query.dentistName = dentistName;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name cpf phone healthInsurance')
      .populate('service', 'name category price durationMinutes')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, appointments });
  } catch (err) {
    next(err);
  }
}

async function getOccupiedSlots(req, res, next) {
  try {
    const { date, dentistName } = req.query;
    if (typeof date !== 'string' || !date) {
      return res.json({ success: true, occupiedSlots: [] });
    }
    const query = { date, status: { $ne: 'cancelado' } };
    if (typeof dentistName === 'string' && dentistName) {
      query.dentistName = dentistName;
    }
    const items = await Appointment.find(query).select('timeSlot dentistName');
    res.json({
      success: true,
      occupiedSlots: items.map((a) => a.timeSlot),
    });
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [totalPatients, totalServices, allAppointments, todayAppointments] = await Promise.all([
      Patient.countDocuments(),
      Service.countDocuments({ active: true }),
      Appointment.find().populate('service', 'price'),
      Appointment.find({ date: today })
        .populate('patient', 'name phone healthInsurance')
        .populate('service', 'name category price durationMinutes')
        .sort({ timeSlot: 1 }),
    ]);

    const activeAppointments = allAppointments.filter((a) => a.status !== 'cancelado');
    const completedAppointments = allAppointments.filter((a) => a.status === 'concluido');
    const estimatedRevenue = activeAppointments.reduce(
      (sum, a) => sum + (a.service?.price || 0),
      0
    );

    res.json({
      success: true,
      summary: {
        totalPatients,
        totalServices,
        totalAppointments: activeAppointments.length,
        completedCount: completedAppointments.length,
        todayCount: todayAppointments.filter((a) => a.status !== 'cancelado').length,
        estimatedRevenue,
        todayAppointments,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createAppointment(req, res, next) {
  try {
    const data = pick(req.body, FIELDS);
    if (!isValidId(data.patient)) {
      return res.status(400).json({ success: false, message: 'Selecione um paciente válido.' });
    }
    if (!isValidId(data.service)) {
      return res.status(400).json({ success: false, message: 'Selecione um procedimento válido.' });
    }

    if (await hasConflict(data)) {
      return res.status(409).json({
        success: false,
        message: 'Este horário já está ocupado para o profissional selecionado.',
      });
    }

    const created = await Appointment.create(data);
    const appointment = await Appointment.findById(created._id)
      .populate('patient', 'name cpf phone healthInsurance')
      .populate('service', 'name category price durationMinutes');

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Agendamento não encontrado.')) return;
    const current = await Appointment.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }

    const data = pick(req.body, FIELDS);
    const nextDate = data.date || current.date;
    const nextSlot = data.timeSlot || current.timeSlot;
    const nextDentist = data.dentistName || current.dentistName;

    if (
      await hasConflict({
        date: nextDate,
        timeSlot: nextSlot,
        dentistName: nextDentist,
        excludeId: current._id,
      })
    ) {
      return res.status(409).json({
        success: false,
        message: 'Este horário já está ocupado para o profissional selecionado.',
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name cpf phone healthInsurance')
      .populate('service', 'name category price durationMinutes');

    res.json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Agendamento não encontrado.')) return;
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
    }
    res.json({ success: true, message: 'Agendamento excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAppointments,
  getOccupiedSlots,
  getSummary,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
