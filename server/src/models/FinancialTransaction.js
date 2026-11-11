const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['receita', 'despesa'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'consulta',
        'procedimento',
        'ortodontia_mensal',
        'clareamento',
        'implante',
        'material_dentario',
        'comissao_dentista',
        'aluguel_clinica',
        'salarios',
        'energia_agua',
        'laboratorio_protese',
        'software_ti',
        'outro',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto', 'transferencia', 'convenio'],
      default: 'pix',
    },
    status: {
      type: String,
      enum: ['pago', 'pendente', 'cancelado'],
      default: 'pago',
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    commission: {
      dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      percentage: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      isPaid: { type: Boolean, default: false },
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

financialTransactionSchema.index({ type: 1, date: -1 });
financialTransactionSchema.index({ status: 1 });

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);
