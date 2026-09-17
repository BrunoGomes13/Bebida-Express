const jwt = require('jsonwebtoken');
const Administrador = require('../models/Administrador');

// Protege rotas REST: exige um token JWT válido no header Authorization.
// Se válido, anexa o administrador logado em req.administrador.
const protegerRota = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodificado = jwt.verify(token, process.env.JWT_SECRET);

      req.administrador = await Administrador.findById(decodificado.id).select('-senha');

      if (!req.administrador) {
        return res.status(401).json({ mensagem: 'Administrador não encontrado.' });
      }

      return next();
    } catch (erro) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    }
  }

  return res.status(401).json({ mensagem: 'Não autorizado. Token não informado.' });
};

module.exports = protegerRota;
