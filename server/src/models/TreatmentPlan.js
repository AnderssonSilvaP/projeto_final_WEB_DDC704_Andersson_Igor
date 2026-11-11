const mongoose = require('mongoose');

const treatmentItemSchema = new mongoose.Schema(
  {
    toothNumber: { type: Number },
    procedureName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Dentística', 'Endodontia', 'Ortodontia', 'Implantodontia', 'Prótese', 'Cirurgia', 'Periodontia', 'Prevenção'],
      default: 'Dentística',
    },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['a_fazer', 'em_andamento', 'concluido'],
      default: 'a_fazer',
    },
  },
  { _id: false }
);

const treatmentPlanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Plano de Tratamento Odontológico Integrado',
    },
    items: [treatmentItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['pix', 'cartao_credito', 'cartao_debito', 'boleto', 'convenio', 'dinheiro'],
      default: 'pix',
    },
    installments: {
      type: Number,
      default: 1,
      min: 1,
      max: 12,
    },
    status: {
      type: String,
      enum: ['pendente', 'aprovado', 'em_execucao', 'concluido', 'recusado'],
      default: 'pendente',
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
    approvedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
