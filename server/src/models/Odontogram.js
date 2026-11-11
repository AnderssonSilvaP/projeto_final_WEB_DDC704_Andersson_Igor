const mongoose = require('mongoose');

const surfaceSchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      enum: ['higido', 'carie', 'restauracao', 'canal', 'coroa', 'implante', 'extracao', 'ortodontia', 'tartaro', 'ausente', 'protese'],
      default: 'higido',
    },
    material: {
      type: String,
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
      validate: { validator: Number.isInteger, message: 'Número do dente inválido' },
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
      default: 85,
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

const ADULT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

odontogramSchema.statics.buildAdultTeeth = function () {
  return ADULT_TEETH.map((toothNumber) => ({
    toothNumber,
    generalCondition: 'higido',
    surfaces: {
      vestibular: { condition: 'higido' },
      lingual: { condition: 'higido' },
      mesial: { condition: 'higido' },
      distal: { condition: 'higido' },
      oclusal: { condition: 'higido' },
    },
    chessTactics: 'best',
    price: 0,
    status: 'higido',
  }));
};

module.exports = mongoose.model('Odontogram', odontogramSchema);
