const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema(
  {
    data: { type: Date, default: Date.now },
    valorTotal: { type: Number, required: true, min: 0 },
    administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venda', vendaSchema);
