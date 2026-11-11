const User = require('../models/User');
const { signToken } = require('../config/jwt');

async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const user = await User.create({ name, email, password, phone, role: 'paciente' });
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
    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Conta desativada.' });
    }

    res.json({ success: true, user, token: signToken(user._id) });
  } catch (err) {
    next(err);
  }
}

function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    ['name', 'phone', 'specialty', 'cro', 'password'].forEach((field) => {
      if (req.body[field]) user[field] = req.body[field];
    });
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const filter = { active: true };
    if (typeof req.query.role === 'string') filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateProfile, getUsers };
