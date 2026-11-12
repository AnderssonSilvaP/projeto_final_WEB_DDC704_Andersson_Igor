const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { escapeRegex, pick, checkId } = require('./shared');

const FIELDS = ['name', 'cpf', 'phone', 'email', 'birthDate', 'healthInsurance', 'notes'];

async function getPatients(req, res, next) {
  try {
    const { search, insurance } = req.query;
    const query = {};

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
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
    }
    res.json({ success: true, patient });
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
    const data = pick(req.body, FIELDS);
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
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
