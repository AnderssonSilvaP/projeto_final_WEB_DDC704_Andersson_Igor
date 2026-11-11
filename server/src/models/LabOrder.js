const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema(
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
    labName: {
      type: String,
      required: true,
      default: 'Laboratório Protético Parceiro',
    },
    itemDescription: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['coroa', 'faceta', 'protese_total', 'protese_parcial', 'placa_bruxismo', 'inlay_onlay', 'protocolo_implante'],
      default: 'coroa',
    },
    shade: {
      type: String,
      default: 'A2 (Escala VITA)',
    },
    teethNumbers: {
      type: [Number],
      default: [],
    },
    dateSent: {
      type: Date,
      default: Date.now,
    },
    dateTryIn: {
      type: Date,
    },
    dateExpected: {
      type: Date,
      required: true,
    },
    dateDelivered: {
      type: Date,
    },
    cost: {
      type: Number,
      required: true,
      default: 350,
      min: 0,
    },
    status: {
      type: String,
      enum: ['enviado', 'em_producao', 'prova_agendada', 'ajustes_solicitados', 'concluido_pronto', 'instalado_paciente'],
      default: 'enviado',
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

module.exports = mongoose.model('LabOrder', labOrderSchema);
