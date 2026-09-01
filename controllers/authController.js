const Administrador = require('../models/Administrador');
const gerarToken = require('../utils/gerarToken');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
    }

    const administrador = await Administrador.findOne({ email });

    if (!administrador || administrador.status !== 'ativo') {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const senhaCorreta = await administrador.compararSenha(senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    return res.json({
      id: administrador._id,
      nome: administrador.nome,
      email: administrador.email,
      token: gerarToken(administrador._id),
    });
  } catch (erro) {
    return res.status(500).json({ mensagem: erro.message });
  }
};

// GET /api/auth/me
// Retorna os dados do administrador dono do token enviado no header Authorization.
// Serve para confirmar, na hora de testar, que o token realmente corresponde
// ao administrador esperado (o authMiddleware já validou o token antes de chegar aqui).
const meuPerfil = async (req, res) => {
  res.json({
    id: req.administrador._id,
    nome: req.administrador.nome,
    email: req.administrador.email,
    status: req.administrador.status,
  });
};

module.exports = { login, meuPerfil };