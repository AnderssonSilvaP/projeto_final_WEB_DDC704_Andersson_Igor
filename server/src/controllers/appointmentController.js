const Appointment = require('../models/Appointment');
const FinancialTransaction = require('../models/FinancialTransaction');
const Patient = require('../models/Patient');

// @desc    Listar consultas com filtros
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { date, dentist, chair, status } = req.query;
    const query = {};

    if (date) query.date = date;
    if (dentist) query.dentist = dentist;
    if (chair) query.chairNumber = Number(chair);
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone cpf eloScore chessRank')
      .populate('dentist', 'name specialty cro avatar')
      .sort({ date: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Listar consultas de hoje
// @route   GET /api/appointments/today
// @access  Private
const getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ date: today })
      .populate('patient', 'name phone cpf eloScore chessRank')
      .populate('dentist', 'name specialty cro avatar')
      .sort({ timeSlot: 1 });

    res.json({
      success: true,
      count: appointments.length,
      date: today,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar nova consulta com detecção de conflitos de horário/cadeira
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
  try {
    const { patient, dentist, chairNumber, date, timeSlot, procedure, durationMinutes, price, notes } = req.body;

    // Verificar se a cadeira já está ocupada neste dia e horário
    const chairConflict = await Appointment.findOne({
      date,
      timeSlot,
      chairNumber,
      status: { $nin: ['cancelado', 'falta'] },
    });

    if (chairConflict) {
      return res.status(400).json({
        success: false,
        message: `A Cadeira Odontológica #${chairNumber} já possui um agendamento às ${timeSlot} na data informada.`,
      });
    }

    // Verificar se o cirurgião-dentista já tem consulta no mesmo horário
    const dentistConflict = await Appointment.findOne({
      date,
      timeSlot,
      dentist,
      status: { $nin: ['cancelado', 'falta'] },
    });

    if (dentistConflict) {
      return res.status(400).json({
        success: false,
        message: `O Cirurgião-Dentista já possui outro procedimento agendado para o horário das ${timeSlot}.`,
      });
    }

    const appointment = await Appointment.create({
      patient,
      dentist,
      chairNumber: chairNumber || 1,
      date,
      timeSlot,
      procedure,
      durationMinutes: durationMinutes || 45,
      price: price || 150,
      notes: notes || '',
      status: 'agendado',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name phone cpf eloScore')
      .populate('dentist', 'name specialty cro');

    res.status(201).json({
      success: true,
      message: 'Consulta agendada com sucesso no tabuleiro clínico.',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar status da consulta (fluxo da clínica: agendado -> confirmado -> aguardando -> em_atendimento -> concluido)
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status, paymentMethod, paid } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('dentist');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Consulta não encontrada' });
    }

    appointment.status = status;

    if (status === 'aguardando') {
      appointment.waitingRoomArrivedAt = new Date();
    } else if (status === 'em_atendimento') {
      appointment.serviceStartedAt = new Date();
    } else if (status === 'concluido') {
      appointment.serviceFinishedAt = new Date();
      if (paid !== undefined) appointment.paid = paid;
      if (paymentMethod) appointment.paymentMethod = paymentMethod;

      // Atualiza data da última visita do paciente
      await Patient.findByIdAndUpdate(appointment.patient._id, {
        lastVisit: new Date(),
        nextRecallDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 meses
        $inc: { eloScore: 25 }, // Recompensa de pontos de saúde bucal!
      });

      // Se foi marcado como pago, registrar transação financeira
      if (appointment.paid || paid) {
        const dentistCommissionRate = appointment.dentist.commissionRate || 50;
        const commAmount = (appointment.price * dentistCommissionRate) / 100;

        await FinancialTransaction.create({
          type: 'receita',
          category: 'consulta',
          description: `Procedimento: ${appointment.procedure} - Paciente: ${appointment.patient.name}`,
          amount: appointment.price,
          paymentMethod: appointment.paymentMethod || 'pix',
          status: 'pago',
          patient: appointment.patient._id,
          dentist: appointment.dentist._id,
          commission: {
            dentist: appointment.dentist._id,
            percentage: dentistCommissionRate,
            amount: commAmount,
            isPaid: false,
          },
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        });
      }
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Status da consulta alterado para: '${status}'.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar detalhes da consulta
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name phone cpf')
      .populate('dentist', 'name specialty');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Consulta não encontrada' });
    }

    res.json({
      success: true,
      message: 'Consulta atualizada com sucesso.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar consulta
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Consulta não encontrada' });
    }

    res.json({
      success: true,
      message: 'Consulta removida da agenda.',
    });
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
