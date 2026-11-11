const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor forneça um e-mail válido'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
    },
    role: {
      type: String,
      enum: ['admin', 'dentista', 'recepcao', 'paciente'],
      default: 'recepcao',
    },
    cro: {
      type: String,
      trim: true,
    },
    specialty: {
      type: String,
      default: 'Clínica Geral',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 1500,
    },
    chessTitle: {
      type: String,
      default: 'Cirurgião-Dentista',
    },
    commissionRate: {
      type: Number,
      default: 50, // % de comissão para dentistas
      min: 0,
      max: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash de senha pré-save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove senha na serialização JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
