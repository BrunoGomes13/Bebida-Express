const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const vendaService = require('../services/vendaService');

// POST /api/vendas
// Corpo esperado: { "itens": [{ "produtoId": "...", "quantidade": 2 }, ...] }
const registrarVenda = async (req, res) => {
  try {
    const venda = await vendaService.registrarVenda(req.body.itens, req.administrador._id);
    res.status(201).json(venda);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

// GET /api/vendas
const listarVendas = async (req, res) => {
  const vendas = await Venda.find().populate('administrador', 'nome').sort({ data: -1 });
  res.json(vendas);
};

// GET /api/vendas/:id - retorna a venda junto com seus itens
const obterVenda = async (req, res) => {
  const venda = await Venda.findById(req.params.id).populate('administrador', 'nome');
  if (!venda) return res.status(404).json({ mensagem: 'Venda não encontrada.' });

  const itens = await ItemVenda.find({ venda: venda._id }).populate('produto', 'nome codigo');

  res.json({ venda, itens });
};

module.exports = { registrarVenda, listarVendas, obterVenda };
