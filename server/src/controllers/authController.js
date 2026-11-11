const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_odontochess_grandmaster_token_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public (ou Admin)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, cro, specialty, phone, chessTitle } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um usuário cadastrado com este e-mail.',
      });
    }

    const defaultRating = role === 'admin' ? 2400 : role === 'dentista' ? 2000 : role === 'recepcao' ? 1600 : 1200;
    const defaultTitle = role === 'admin' ? 'GM' : role === 'dentista' ? 'IM' : 'CM';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'recepcao',
      cro,
      specialty: specialty || 'Clínica Geral',
      phone,
      rating: defaultRating,
      chessTitle: chessTitle || defaultTitle,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe e-mail e senha.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas: e-mail não encontrado.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas: senha incorreta.',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Conta inativa. Contate a administração da clínica.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Bem-vindo(a), ${user.name}!`,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter usuário atual logado
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.specialty = req.body.specialty || user.specialty;
    user.cro = req.body.cro || user.cro;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Listar usuários / dentistas da clínica
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = { active: true };
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getUsers,
};
