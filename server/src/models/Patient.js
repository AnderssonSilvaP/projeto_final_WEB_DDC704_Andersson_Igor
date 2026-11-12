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
    healthInsurance: {
      type: String,
      enum: ['Particular', 'Uniodonto', 'Bradesco Dental', 'Amil Dental'],
      default: 'Particular',
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
