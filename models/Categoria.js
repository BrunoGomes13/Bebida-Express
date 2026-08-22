const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true, trim: true },
    descricao: { type: String, trim: true },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categoria', categoriaSchema);
