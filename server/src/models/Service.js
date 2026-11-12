const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do procedimento é obrigatório'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Avaliação', 'Prevenção', 'Estética', 'Ortodontia', 'Endodontia', 'Cirurgia', 'Implantes'],
      default: 'Avaliação',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duração estimada é obrigatória'],
      min: [15, 'Duração mínima é de 15 minutos'],
      default: 30,
    },
    price: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: [0, 'O valor não pode ser negativo'],
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
