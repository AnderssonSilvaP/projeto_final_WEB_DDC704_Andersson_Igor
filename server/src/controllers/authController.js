const User = require('../models/User');
const Patient = require('../models/Patient');
const { signToken } = require('../config/jwt');

async function register(req, res, next) {
  try {
    const { name, email, password, phone, cpf, birthDate } = req.body;
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

    if (name && (cpf || phone)) {
      const existingPatient = await Patient.findOne({
        $or: [
          ...(cpf ? [{ cpf: String(cpf).trim() }] : []),
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
      });
      if (!existingPatient) {
        await Patient.create({
          name: String(name).trim(),
          cpf: cpf ? String(cpf).trim() : `000.${Date.now().toString().slice(-6)}-00`,
          phone: phone ? String(phone).trim() : '(95) 99100-0000',
          email: normalizedEmail,
          birthDate: birthDate ? new Date(birthDate) : new Date('1995-01-01'),
          healthInsurance: 'Particular',
        });
      }
    }

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

    res.json({ success: true, user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { register, login, getMe };
