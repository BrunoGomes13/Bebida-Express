const mongoose = require('mongoose');

const movimentacaoSchema = new mongoose.Schema(
  {
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    venda: { type: mongoose.Schema.Types.ObjectId, ref: 'Venda' },
    tipo: { type: String, enum: ['entrada', 'saida'], required: true },
    quantidade: { type: Number, required: true, min: 1 },
    estoqueAnterior: { type: Number, required: true },
    estoquePosterior: { type: Number, required: true },
    administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movimentacao', movimentacaoSchema);
