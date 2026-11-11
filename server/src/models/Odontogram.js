const mongoose = require('mongoose');

const surfaceSchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      enum: ['higido', 'carie', 'restauracao', 'canal', 'coroa', 'implante', 'extracao', 'ortodontia', 'tartaro', 'ausente', 'protese'],
      default: 'higido',
    },
    material: {
      type: String, // ex: Resina Composta, Amálgama, Cerômero, Zircônia
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const toothRecordSchema = new mongoose.Schema(
  {
    toothNumber: {
      type: Number,
      required: true,
      min: 11,
      max: 85,
    },
    generalCondition: {
      type: String,
      enum: ['higido', 'carie', 'restauracao', 'canal', 'coroa', 'implante', 'extracao', 'ortodontia', 'tartaro', 'ausente', 'protese'],
      default: 'higido',
    },
    surfaces: {
      vestibular: { type: surfaceSchema, default: () => ({ condition: 'higido' }) },
      lingual: { type: surfaceSchema, default: () => ({ condition: 'higido' }) },
      mesial: { type: surfaceSchema, default: () => ({ condition: 'higido' }) },
      distal: { type: surfaceSchema, default: () => ({ condition: 'higido' }) },
      oclusal: { type: surfaceSchema, default: () => ({ condition: 'higido' }) },
    },
    chessTactics: {
      type: String,
      enum: ['best', 'brilliant', 'good', 'inaccuracy', 'mistake', 'blunder'],
      default: 'best',
    },
    notes: {
      type: String,
      default: '',
    },
    procedureName: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['higido', 'necessita_tratamento', 'em_andamento', 'concluido'],
      default: 'higido',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const odontogramSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    archType: {
      type: String,
      enum: ['adulto', 'infantil', 'misto'],
      default: 'adulto',
    },
    teeth: [toothRecordSchema],
    generalHealthScore: {
      type: Number,
      default: 85, // 0 a 100%
    },
    tacticalSummary: {
      cariesCount: { type: Number, default: 0 },
      restorationCount: { type: Number, default: 0 },
      rootCanalCount: { type: Number, default: 0 },
      implantCount: { type: Number, default: 0 },
      missingCount: { type: Number, default: 0 },
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

module.exports = mongoose.model('Odontogram', odontogramSchema);
