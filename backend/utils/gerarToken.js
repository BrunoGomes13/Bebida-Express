const jwt = require('jsonwebtoken');

// Gera um token JWT contendo o id do administrador logado
const gerarToken = (administradorId) => {
  return jwt.sign({ id: administradorId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

module.exports = gerarToken;
