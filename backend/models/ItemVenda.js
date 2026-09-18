const mongoose = require('mongoose');

const itemVendaSchema = new mongoose.Schema(
  {
    venda: { type: mongoose.Schema.Types.ObjectId, ref: 'Venda', required: true },
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    quantidade: { type: Number, required: true, min: 1 },
    precoUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ItemVenda', itemVendaSchema);
