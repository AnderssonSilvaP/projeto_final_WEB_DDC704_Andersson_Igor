const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do material é obrigatório'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['anestesico', 'resina', 'descartavel', 'cirurgia', 'ortodontia', 'endodontia', 'biosseguranca', 'moldagem', 'clareamento'],
      default: 'descartavel',
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    minStock: {
      type: Number,
      default: 5,
      min: 0,
    },
    unit: {
      type: String,
      default: 'unidades', // 'caixas', 'tubetes', 'seringas', 'frascos', 'pacotes'
    },
    batchNumber: {
      type: String,
      default: 'LT-2026-A1',
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      type: String,
      default: 'Dental Cremer Distribuidora',
    },
    location: {
      type: String,
      default: 'Armário Principal - Gaveta 1',
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

supplySchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minStock;
});

supplySchema.virtual('isExpired').get(function () {
  return new Date(this.expirationDate) < new Date();
});

module.exports = mongoose.model('Supply', supplySchema);
