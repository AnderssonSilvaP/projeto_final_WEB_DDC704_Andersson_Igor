const jwt = require('jsonwebtoken');

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não definida');
  return process.env.JWT_SECRET;
}

const signToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '30d' });
const verifyToken = (token) => jwt.verify(token, secret());

module.exports = { signToken, verifyToken };
