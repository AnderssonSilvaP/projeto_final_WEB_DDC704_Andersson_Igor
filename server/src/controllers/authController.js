const User = require('../models/User');
const { signToken } = require('../config/jwt');
const { ensurePatientForUser } = require('./shared');

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      phone,
      emergencyContact,
      cpf,
      birthDate,
      gender,
      cep,
      address,
      city,
      state,
      healthInsurance,
      insuranceNumber,
      allergies,
    } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

    if (normalizedEmail && (await User.findOne({ email: normalizedEmail }))) {
      return res.status(400).json({ success: false, message: 'Já existe uma conta com este e-mail.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: phone || '',
      role: 'paciente',
    });

    await ensurePatientForUser(user, {
      name,
      cpf,
      phone,
      emergencyContact,
      birthDate,
      gender,
      cep,
      address,
      city,
      state,
      healthInsurance,
      insuranceNumber,
      allergies,
    });

    res.status(201).json({ success: true, user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ success: false, message: 'Informe e-mail e senha.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }

    if (user.role === 'paciente') {
      await ensurePatientForUser(user);
    }

    res.json({ success: true, user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

async function getDentists(req, res, next) {
  try {
    const dentists = await User.find({ role: 'medico' })
      .select('name email phone specialty cro')
      .sort({ name: 1 });
    res.json({ success: true, dentists });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, getDentists };
