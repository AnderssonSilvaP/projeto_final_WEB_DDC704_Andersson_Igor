const mongoose = require('mongoose');

const clinicalEvolutionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    dentistName: {
      type: String,
      required: true,
    },
    procedureDescription: {
      type: String,
      required: true,
    },
    teethInvolved: {
      type: [Number],
      default: [],
    },
    anesthesiaUsed: {
      type: String,
      default: '',
    },
    patientEvolutionState: {
      type: String,
      enum: ['Normal', 'Edema leve', 'Sensibilidade', 'Excelente cicatrização'],
      default: 'Normal',
    },
    nextStep: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const prescriptionItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // ex: Amoxicilina 500mg
    dosage: { type: String, required: true }, // ex: 1 cápsula
    frequency: { type: String, required: true }, // ex: a cada 8 horas
    duration: { type: String, required: true }, // ex: por 7 dias
    instructions: { type: String, default: 'Ingerir com água após as refeições.' },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    dentistName: {
      type: String,
      required: true,
    },
    medications: [prescriptionItemSchema],
    generalInstructions: {
      type: String,
      default: 'Evitar alimentos quentes nas primeiras 24 horas e repouso moderado.',
    },
  },
  { timestamps: true }
);

const certificateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    dentistName: {
      type: String,
      required: true,
    },
    daysOff: {
      type: Number,
      required: true,
      default: 1,
    },
    cidCode: {
      type: String,
      default: 'K02.1', // Cárie dentinária
    },
    cidDescription: {
      type: String,
      default: 'Cárie da dentina / Procedimento restaurador',
    },
    period: {
      type: String,
      default: 'Repouso domiciliar pós-operatório',
    },
  },
  { timestamps: true }
);

const radiographSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['panoramica', 'periapical', 'interproximal', 'tomografia', 'fotografia'],
      default: 'panoramica',
    },
    date: { type: Date, default: Date.now },
    url: { type: String, default: '' },
    findings: { type: String, default: '' },
  },
  { timestamps: true }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
    },
    dentistInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    anamnese: {
      mainComplaint: { type: String, default: 'Check-up de rotina e profilaxia' },
      historyOfPresentIllness: { type: String, default: '' },
      hypertension: { type: Boolean, default: false },
      diabetes: { type: Boolean, default: false },
      cardiacDisease: { type: Boolean, default: false },
      bleedingDisorder: { type: Boolean, default: false },
      isPregnant: { type: Boolean, default: false },
      isSmoker: { type: Boolean, default: false },
      allergiesDetails: { type: String, default: 'Nenhuma alergia relatada' },
      medicationsInUse: { type: String, default: 'Nenhuma' },
      previousSurgeries: { type: String, default: 'Nenhuma' },
      anestheticReaction: { type: Boolean, default: false },
      bruxism: { type: Boolean, default: false },
      notes: { type: String, default: '' },
    },
    clinicalEvolutions: [clinicalEvolutionSchema],
    prescriptions: [prescriptionSchema],
    certificates: [certificateSchema],
    radiographs: [radiographSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
