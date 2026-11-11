const MedicalRecord = require('../models/MedicalRecord');

// @desc    Obter Prontuário Eletrônico do Paciente (PEP)
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
const getMedicalRecord = async (req, res, next) => {
  try {
    let record = await MedicalRecord.findOne({ patient: req.params.patientId })
      .populate('patient', 'name cpf birthDate phone allergies chronicConditions eloScore')
      .populate('dentistInCharge', 'name specialty cro');

    if (!record) {
      record = await MedicalRecord.create({
        patient: req.params.patientId,
        dentistInCharge: req.user._id,
      });
      record = await MedicalRecord.findById(record._id)
        .populate('patient', 'name cpf birthDate phone allergies chronicConditions eloScore')
        .populate('dentistInCharge', 'name specialty cro');
    }

    res.json({
      success: true,
      medicalRecord: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar Anamnese
// @route   PUT /api/medical-records/patient/:patientId/anamnese
// @access  Private
const updateAnamnese = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOne({ patient: req.params.patientId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Prontuário não encontrado' });
    }

    record.anamnese = { ...record.anamnese.toObject(), ...req.body };
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

// @desc    Adicionar Evolução Clínica
// @route   POST /api/medical-records/patient/:patientId/evolutions
// @access  Private
const addEvolution = async (req, res, next) => {
  try {
    const { procedureDescription, teethInvolved, anesthesiaUsed, patientEvolutionState, nextStep } = req.body;
    const record = await MedicalRecord.findOne({ patient: req.params.patientId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Prontuário não encontrado' });
    }

    const newEvolution = {
      dentistName: req.user.name,
      procedureDescription,
      teethInvolved: teethInvolved || [],
      anesthesiaUsed: anesthesiaUsed || '',
      patientEvolutionState: patientEvolutionState || 'Normal',
      nextStep: nextStep || '',
      date: new Date(),
    };

    record.clinicalEvolutions.unshift(newEvolution);
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

// @desc    Emitir Receita Odontológica
// @route   POST /api/medical-records/patient/:patientId/prescriptions
// @access  Private
const addPrescription = async (req, res, next) => {
  try {
    const { medications, generalInstructions } = req.body;
    const record = await MedicalRecord.findOne({ patient: req.params.patientId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Prontuário não encontrado' });
    }

    const prescription = {
      dentistName: req.user.name,
      medications: medications || [],
      generalInstructions: generalInstructions || 'Tomar conforme posologia prescrita.',
      date: new Date(),
    };

    record.prescriptions.unshift(prescription);
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

// @desc    Emitir Atestado Odontológico
// @route   POST /api/medical-records/patient/:patientId/certificates
// @access  Private
const addCertificate = async (req, res, next) => {
  try {
    const { daysOff, cidCode, cidDescription, period } = req.body;
    const record = await MedicalRecord.findOne({ patient: req.params.patientId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Prontuário não encontrado' });
    }

    const certificate = {
      dentistName: req.user.name,
      daysOff: daysOff || 1,
      cidCode: cidCode || 'K02.1',
      cidDescription: cidDescription || 'Procedimento cirúrgico/restaurador odontológico',
      period: period || 'Repouso domiciliar',
      date: new Date(),
    };

    record.certificates.unshift(certificate);
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

// @desc    Adicionar Radiografia / Exame
// @route   POST /api/medical-records/patient/:patientId/radiographs
// @access  Private
const addRadiograph = async (req, res, next) => {
  try {
    const { title, type, url, findings } = req.body;
    const record = await MedicalRecord.findOne({ patient: req.params.patientId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Prontuário não encontrado' });
    }

    record.radiographs.unshift({
      title,
      type: type || 'panoramica',
      url: url || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600',
      findings: findings || 'Sem alterações patológicas visíveis na crista óssea.',
      date: new Date(),
    });

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
