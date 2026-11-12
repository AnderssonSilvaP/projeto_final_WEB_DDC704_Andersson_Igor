const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { escapeRegex, pick, checkId, ensurePatientForUser } = require('./shared');

const FIELDS = [
  'name',
  'cpf',
  'phone',
  'emergencyContact',
  'email',
  'birthDate',
  'gender',
  'cep',
  'address',
  'city',
  'state',
  'healthInsurance',
  'insuranceNumber',
  'allergies',
  'notes',
];
const SELF_FIELDS = [
  'name',
  'cpf',
  'phone',
  'emergencyContact',
  'birthDate',
  'gender',
  'cep',
  'address',
  'city',
  'state',
  'healthInsurance',
  'insuranceNumber',
  'allergies',
];

async function getMyPatientProfile(req, res, next) {
  try {
    const patient = await ensurePatientForUser(req.user);
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('service', 'name category price durationMinutes')
      .sort({ date: -1, timeSlot: -1 });

    res.json({ success: true, patient, appointments });
  } catch (err) {
    next(err);
  }
}

async function updateMyPatientProfile(req, res, next) {
  try {
    const current = await ensurePatientForUser(req.user);
    const data = pick(req.body, SELF_FIELDS);

    const patient = await Patient.findByIdAndUpdate(current._id, data, {
      new: true,
      runValidators: true,
    });

    if (data.name || data.phone) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      });
    }

    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}

async function getPatients(req, res, next) {
  try {
    if (req.user.role === 'paciente') {
      const ownPatient = await ensurePatientForUser(req.user);
      return res.json({ success: true, patients: ownPatient ? [ownPatient] : [] });
    }

    const { search, insurance, onlyMine } = req.query;
    const query = {};

    if (req.user.role === 'medico' && onlyMine === 'true') {
      const myPatientIds = await Appointment.find({ dentistName: req.user.name }).distinct('patient');
      query._id = { $in: myPatientIds };
    }

    if (typeof search === 'string' && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [{ name: regex }, { cpf: regex }, { phone: regex }, { email: regex }];
    }

    if (typeof insurance === 'string' && insurance && insurance !== 'todos') {
      query.healthInsurance = insurance;
    }

    const patients = await Patient.find(query).sort({ name: 1 });
    res.json({ success: true, patients });
  } catch (err) {
    next(err);
  }
}

async function getPatientById(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Paciente não encontrado.')) return;

    if (req.user.role === 'paciente') {
      const ownPatient = await ensurePatientForUser(req.user);
      if (!ownPatient || String(ownPatient._id) !== String(req.params.id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado: você só pode visualizar sua própria ficha.',
        });
      }
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
    }
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}

async function getPatientHistory(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Paciente não encontrado.')) return;
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate('service', 'name category price durationMinutes')
      .sort({ date: -1, timeSlot: -1 });

    res.json({ success: true, patient, appointments });
  } catch (err) {
    next(err);
  }
}

async function createPatient(req, res, next) {
  try {
    const data = pick(req.body, FIELDS);
    const patient = await Patient.create(data);
    res.status(201).json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}

async function updatePatient(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Paciente não encontrado.')) return;
    const allowedFields =
      req.user.role === 'medico' ? ['notes', 'allergies', 'healthInsurance', 'phone'] : FIELDS;
    const data = pick(req.body, allowedFields);

    const patient = await Patient.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
    }
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
}

async function deletePatient(req, res, next) {
  try {
    if (!checkId(res, req.params.id, 'Paciente não encontrado.')) return;
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
    }
    await Appointment.deleteMany({ patient: patient._id });
    res.json({ success: true, message: 'Paciente excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyPatientProfile,
  updateMyPatientProfile,
  getPatients,
  getPatientById,
  getPatientHistory,
  createPatient,
  updatePatient,
  deletePatient,
};
