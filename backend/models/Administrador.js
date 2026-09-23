const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const administradorSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  },
  { timestamps: true } // cria createdAt/updatedAt automaticamente
);

// Antes de salvar, criptografa a senha (só roda se a senha foi criada/alterada)
administradorSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Compara a senha digitada no login com o hash salvo no banco
administradorSchema.methods.compararSenha = async function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Administrador', administradorSchema);
