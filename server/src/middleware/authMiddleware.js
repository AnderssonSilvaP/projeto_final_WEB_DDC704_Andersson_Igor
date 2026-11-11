const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

const fail = (res, status, message) => res.status(status).json({ success: false, message });

async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'Token de autenticação não fornecido.');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return fail(res, 401, 'Token inválido ou expirado.');
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return fail(res, 401, 'Usuário do token não existe mais.');
    if (!user.active) return fail(res, 403, 'Conta desativada.');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, 403, 'Acesso negado: perfil sem permissão para esta ação.');
  }
  next();
};

module.exports = { protect, authorize };
