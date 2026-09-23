const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema(
  {
    data: { type: Date, default: Date.now },
    nomeComprador: { type: String, required: true, trim: true },
    cpfComprador: { type: String, trim: true },
    valorBruto: { type: Number, required: true, min: 0 },
    desconto: { type: Number, required: true, min: 0, default: 0 },
    valorTotal: { type: Number, required: true, min: 0 },
    administrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrador', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venda', vendaSchema);
