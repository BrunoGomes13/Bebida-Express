const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
    preco: { type: Number, required: true, min: 0 },
    quantidadeEstoque: { type: Number, required: true, min: 0, default: 0 },
    estoqueMinimo: { type: Number, required: true, min: 0, default: 5 },
    imagem: { type: String, default: '' },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  },
  { timestamps: true }
);

// Campo virtual: calcula "normal" / "estoque_baixo" / "esgotado" sem
// precisar guardar esse valor no banco (evita ficar desatualizado).
//
// Além do limite configurado em "estoqueMinimo", existe uma margem de
// segurança fixa (MARGEM_SEGURANCA): mesmo que um produto tenha sido
// cadastrado com estoqueMinimo igual a 0, ele ainda é avisado como
// "estoque_baixo" assim que sobrarem poucas unidades — sem isso, um
// produto pularia direto de "normal" para "esgotado" sem nunca passar
// por um aviso de estoque baixo.
const MARGEM_SEGURANCA = 2;

produtoSchema.virtual('statusEstoque').get(function () {
  if (this.quantidadeEstoque <= 0) return 'esgotado';
  if (this.quantidadeEstoque <= this.estoqueMinimo) return 'estoque_baixo';
  if (this.quantidadeEstoque <= MARGEM_SEGURANCA) return 'estoque_baixo';
  return 'normal';
});

// Faz o campo virtual aparecer quando o documento é convertido para JSON
produtoSchema.set('toJSON', { virtuals: true });
produtoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Produto', produtoSchema);
