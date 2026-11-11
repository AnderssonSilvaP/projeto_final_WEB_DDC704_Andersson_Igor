const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado: Token de autenticação não fornecido.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_odontochess_grandmaster_token_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'O usuário deste token não existe mais no sistema.',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Sua conta de usuário está desativada pela administração.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
      error: error.message,
    });
  }
};

// Controle de Acesso Baseado em Papéis (RBAC - AuthZ)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado: Perfil '${req.user ? req.user.role : 'anônimo'}' não possui permissão tática para executar esta ação. Requer: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
