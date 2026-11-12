const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Paciente é obrigatório'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Procedimento é obrigatório'],
    },
    dentistName: {
      type: String,
      required: [true, 'Profissional é obrigatório'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Data é obrigatória'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Horário é obrigatório'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve estar no formato HH:mm'],
    },
    status: {
      type: String,
      enum: ['agendado', 'confirmado', 'concluido', 'cancelado'],
      default: 'agendado',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, timeSlot: 1, dentistName: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
