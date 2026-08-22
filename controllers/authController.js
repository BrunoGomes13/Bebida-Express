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

module.exports = { login };
