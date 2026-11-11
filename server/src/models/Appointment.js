const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Paciente é obrigatório'],
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cirurgião-Dentista é obrigatório'],
    },
    chairNumber: {
      type: Number,
      enum: [1, 2, 3],
      default: 1, // 1: Cadeira Titânio (Cirurgia/Implante), 2: Cadeira Ouro (Ortodontia/Estética), 3: Cadeira Esmeralda (Clínica Geral)
    },
    date: {
      type: String, // Formato YYYY-MM-DD para busca exata e comparativos de agenda
      required: [true, 'Data é obrigatória'],
    },
    timeSlot: {
      type: String, // Formato HH:mm
      required: [true, 'Horário é obrigatório'],
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    procedure: {
      type: String,
      required: [true, 'Procedimento é obrigatório'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['clinica_geral', 'ortodontia', 'implantodontia', 'endodontia', 'cirurgia', 'estetica', 'periodontia', 'odontopediatria'],
      default: 'clinica_geral',
    },
    status: {
      type: String,
      enum: ['agendado', 'confirmado', 'aguardando', 'em_atendimento', 'concluido', 'cancelado', 'falta'],
      default: 'agendado',
    },
    waitingRoomArrivedAt: {
      type: Date,
    },
    serviceStartedAt: {
      type: Date,
    },
    serviceFinishedAt: {
      type: Date,
    },
    price: {
      type: Number,
      default: 150,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'convenio', 'pendente'],
      default: 'pendente',
    },
    notes: {
      type: String,
      default: '',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ date: 1, timeSlot: 1, chairNumber: 1 });
appointmentSchema.index({ date: 1, dentist: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
