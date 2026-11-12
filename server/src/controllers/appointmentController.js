const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const { pick, checkId, isValidId, ensurePatientForUser } = require('./shared');

const FIELDS = [
  'patient',
  'service',
  'dentistName',
  'date',
  'timeSlot',
  'status',
  'notes',
  'clinicalNotes',
  'recommendations',
];

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

    if (req.user.role === 'paciente') {
      const ownPatient = await ensurePatientForUser(req.user);
      query.patient = ownPatient._id;
    } else if (req.user.role === 'medico') {
      query.dentistName = req.user.name;
    } else if (typeof dentistName === 'string' && dentistName && dentistName !== 'todos') {
      query.dentistName = dentistName;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name cpf phone email birthDate healthInsurance allergies notes')
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
    const [allPatients, totalServices, allAppointments, todayAppointments] = await Promise.all([
      Patient.find().select('name healthInsurance'),
      Service.countDocuments({ active: true }),
      Appointment.find()
        .populate('patient', 'name healthInsurance')
        .populate('service', 'name category price durationMinutes'),
      Appointment.find({ date: today })
        .populate('patient', 'name phone healthInsurance')
        .populate('service', 'name category price durationMinutes')
        .sort({ timeSlot: 1 }),
    ]);

    const totalPatients = allPatients.length;
    const activeAppointments = allAppointments.filter((a) => a.status !== 'cancelado');
    const completedAppointments = allAppointments.filter((a) => a.status === 'concluido');
    const canceledAppointments = allAppointments.filter((a) => a.status === 'cancelado');

    const estimatedRevenue = activeAppointments.reduce(
      (sum, a) => sum + (a.service?.price || 0),
      0
    );
    const realizedRevenue = completedAppointments.reduce(
      (sum, a) => sum + (a.service?.price || 0),
      0
    );

    const statusBreakdown = {
      agendado: allAppointments.filter((a) => a.status === 'agendado').length,
      confirmado: allAppointments.filter((a) => a.status === 'confirmado').length,
      concluido: completedAppointments.length,
      cancelado: canceledAppointments.length,
    };

    const dentistMap = {};
    allAppointments.forEach((a) => {
      const name = a.dentistName || 'Não informado';
      if (!dentistMap[name]) {
        dentistMap[name] = {
          dentistName: name,
          total: 0,
          completed: 0,
          confirmed: 0,
          scheduled: 0,
          canceled: 0,
          realizedRevenue: 0,
          estimatedRevenue: 0,
        };
      }
      const price = a.service?.price || 0;
      dentistMap[name].total += 1;
      if (a.status === 'concluido') {
        dentistMap[name].completed += 1;
        dentistMap[name].realizedRevenue += price;
        dentistMap[name].estimatedRevenue += price;
      } else if (a.status === 'confirmado') {
        dentistMap[name].confirmed += 1;
        dentistMap[name].estimatedRevenue += price;
      } else if (a.status === 'agendado') {
        dentistMap[name].scheduled += 1;
        dentistMap[name].estimatedRevenue += price;
      } else if (a.status === 'cancelado') {
        dentistMap[name].canceled += 1;
      }
    });

    const categoryMap = {};
    activeAppointments.forEach((a) => {
      const cat = a.service?.category || 'Outros';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, count: 0, completedCount: 0, revenue: 0 };
      }
      const price = a.service?.price || 0;
      categoryMap[cat].count += 1;
      categoryMap[cat].revenue += price;
      if (a.status === 'concluido') categoryMap[cat].completedCount += 1;
    });

    const insurances = ['Particular', 'Uniodonto', 'Bradesco Dental', 'Amil Dental'];
    const byInsurance = insurances.map((ins) => {
      const patCount = allPatients.filter((p) => p.healthInsurance === ins).length;
      const apps = activeAppointments.filter((a) => a.patient?.healthInsurance === ins);
      const rev = apps.reduce((sum, a) => sum + (a.service?.price || 0), 0);
      return {
        insurance: ins,
        patientCount: patCount,
        appointmentCount: apps.length,
        revenue: rev,
      };
    });

    res.json({
      success: true,
      summary: {
        totalPatients,
        totalServices,
        totalAppointments: activeAppointments.length,
        completedCount: completedAppointments.length,
        canceledCount: canceledAppointments.length,
        todayCount: todayAppointments.filter((a) => a.status !== 'cancelado').length,
        estimatedRevenue,
        realizedRevenue,
        statusBreakdown,
        byDentist: Object.values(dentistMap),
        byCategory: Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue),
        byInsurance,
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

    if (req.user.role === 'paciente') {
      const ownPatient = await ensurePatientForUser(req.user);
      if (data.patient && String(data.patient) !== String(ownPatient._id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: você não pode agendar consulta para outro cliente.',
        });
      }
      data.patient = String(ownPatient._id);
      data.status = 'agendado';
      delete data.clinicalNotes;
      delete data.recommendations;
    } else if (req.user.role === 'medico') {
      data.dentistName = req.user.name;
    }

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
      .populate('patient', 'name cpf phone email birthDate healthInsurance allergies notes')
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

    if (req.user.role === 'paciente') {
      const ownPatient = await ensurePatientForUser(req.user);
      if (String(current.patient) !== String(ownPatient._id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: você só pode gerenciar seus próprios agendamentos.',
        });
      }
      delete data.patient;
      delete data.clinicalNotes;
      delete data.recommendations;
      if (data.status && !['agendado', 'cancelado'].includes(data.status)) {
        return res.status(403).json({
          success: false,
          message: 'Pacientes podem apenas remarcar ou cancelar suas consultas.',
        });
      }
    } else if (req.user.role === 'medico') {
      if (current.dentistName !== req.user.name) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: você só pode gerenciar consultas atribuídas à sua agenda.',
        });
      }
      delete data.patient;
      data.dentistName = req.user.name;
    }

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
      .populate('patient', 'name cpf phone email birthDate healthInsurance allergies notes')
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
