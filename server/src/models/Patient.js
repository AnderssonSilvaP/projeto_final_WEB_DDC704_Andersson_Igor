const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
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
    phone: {
      type: String,
      required: [true, 'Telefone é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    birthDate: {
      type: Date,
      required: [true, 'Data de nascimento é obrigatória'],
    },
    gender: {
      type: String,
      enum: ['Não informado', 'Masculino', 'Feminino', 'Outro'],
      default: 'Não informado',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
    cep: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: 'Boa Vista',
    },
    state: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'RR',
    },
    healthInsurance: {
      type: String,
      enum: ['Particular', 'Uniodonto', 'Bradesco Dental', 'Amil Dental'],
      default: 'Particular',
    },
    insuranceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    allergies: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
