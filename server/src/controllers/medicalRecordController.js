const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const { pick, checkId, sendNotFound, sendBadRequest } = require('./shared');

const PATIENT_NOT_FOUND = 'Paciente não encontrado';
const RECORD_NOT_FOUND = 'Prontuário não encontrado';
const PATIENT_FIELDS = 'name cpf birthDate phone allergies chronicConditions eloScore';
const ANAMNESE_FIELDS = [
  'mainComplaint', 'historyOfPresentIllness', 'hypertension', 'diabetes', 'cardiacDisease',
  'bleedingDisorder', 'isPregnant', 'isSmoker', 'allergiesDetails', 'medicationsInUse',
  'previousSurgeries', 'anestheticReaction', 'bruxism', 'notes',
];

// Loads the record for a patient, answering 404 itself when the id or record is missing.
const loadRecord = async (req, res) => {
  if (!checkId(res, req.params.patientId, PATIENT_NOT_FOUND)) return null;
  const record = await MedicalRecord.findOne({ patient: req.params.patientId });
  if (!record) sendNotFound(res, RECORD_NOT_FOUND);
  return record;
};

const getMedicalRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    if (!checkId(res, patientId, PATIENT_NOT_FOUND)) return;

    let record = await MedicalRecord.findOne({ patient: patientId });
    if (!record) {
      if (!(await Patient.exists({ _id: patientId }))) return sendNotFound(res, PATIENT_NOT_FOUND);
      record = await MedicalRecord.create({ patient: patientId, dentistInCharge: req.user._id });
    }

    record = await MedicalRecord.findById(record._id)
      .populate('patient', PATIENT_FIELDS)
      .populate('dentistInCharge', 'name specialty cro');

    res.json({ success: true, medicalRecord: record });
  } catch (error) {
    next(error);
  }
};

const updateAnamnese = async (req, res, next) => {
  try {
    const record = await loadRecord(req, res);
    if (!record) return;

    record.anamnese = { ...record.anamnese.toObject(), ...pick(req.body, ANAMNESE_FIELDS) };
    await record.save();

    res.json({
      success: true,
      message: 'Ficha de anamnese atualizada com sucesso.',
      anamnese: record.anamnese,
    });
  } catch (error) {
    next(error);
  }
};

const addEvolution = async (req, res, next) => {
  try {
    const record = await loadRecord(req, res);
    if (!record) return;

    const data = pick(req.body, [
      'procedureDescription', 'teethInvolved', 'anesthesiaUsed', 'patientEvolutionState', 'nextStep',
    ]);
    record.clinicalEvolutions.unshift({ ...data, dentistName: req.user.name, date: new Date() });
    await record.save();

    res.status(201).json({
      success: true,
      message: 'Evolução clínica registrada no prontuário.',
      evolutions: record.clinicalEvolutions,
    });
  } catch (error) {
    next(error);
  }
};

const addPrescription = async (req, res, next) => {
  try {
    const { medications, generalInstructions } = req.body;
    if (!Array.isArray(medications) || medications.length === 0) {
      return sendBadRequest(res, 'Informe ao menos um medicamento na receita.');
    }

    const record = await loadRecord(req, res);
    if (!record) return;

    record.prescriptions.unshift({
      dentistName: req.user.name,
      medications: medications.map((m) => pick(m, ['name', 'dosage', 'frequency', 'duration', 'instructions'])),
      generalInstructions: generalInstructions || 'Tomar conforme posologia prescrita.',
      date: new Date(),
    });
    await record.save();

    res.status(201).json({
      success: true,
      message: 'Receituário odontológico emitido com sucesso.',
      prescriptions: record.prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

const addCertificate = async (req, res, next) => {
  try {
    const record = await loadRecord(req, res);
    if (!record) return;

    const data = pick(req.body, ['daysOff', 'cidCode', 'cidDescription', 'period']);
    record.certificates.unshift({ ...data, dentistName: req.user.name, date: new Date() });
    await record.save();

    res.status(201).json({
      success: true,
      message: 'Atestado emitido com sucesso.',
      certificates: record.certificates,
    });
  } catch (error) {
    next(error);
  }
};

const addRadiograph = async (req, res, next) => {
  try {
    const record = await loadRecord(req, res);
    if (!record) return;

    const data = pick(req.body, ['title', 'type', 'url', 'findings']);
    record.radiographs.unshift({ ...data, date: new Date() });
    await record.save();

    res.status(201).json({
      success: true,
      message: 'Exame radiológico anexado ao prontuário.',
      radiographs: record.radiographs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecord,
  updateAnamnese,
  addEvolution,
  addPrescription,
  addCertificate,
  addRadiograph,
};
