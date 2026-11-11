const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do paciente é obrigatório'],
      trim: true,
    },
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      unique: true,
      trim: true,
    },
    rg: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: [true, 'Data de nascimento é obrigatória'],
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'Outro'],
      default: 'M',
    },
    phone: {
      type: String,
      required: [true, 'Telefone de contato é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      number: { type: String, default: '' },
      complement: { type: String, default: '' },
      neighborhood: { type: String, default: '' },
      city: { type: String, default: 'Boa Vista' },
      state: { type: String, default: 'RR' },
      zip: { type: String, default: '' },
    },
    healthInsurance: {
      planName: { type: String, default: 'Particular' }, // 'Particular', 'Uniodonto', 'Bradesco Dental', 'Amil Dental'
      cardNumber: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não informado'],
      default: 'Não informado',
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
    eloScore: {
      type: Number,
      default: 1500, // Rating Chess de Higiene e Assiduidade
    },
    chessRank: {
      type: String,
      default: 'Candidato a Mestre Bucal',
    },
    notes: {
      type: String,
      default: '',
    },
    lastVisit: {
      type: Date,
    },
    nextRecallDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ name: 'text', cpf: 'text', phone: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
