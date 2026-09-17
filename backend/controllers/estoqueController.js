const Produto = require('../models/Produto');

// GET /api/estoque - visão geral do estoque de todos os produtos ativos
const listarEstoque = async (req, res) => {
  const produtos = await Produto.find({ status: 'ativo' })
    .populate('categoria', 'nome')
    .sort({ nome: 1 });

  const resultado = produtos.map((produto) => ({
    id: produto._id,
    nome: produto.nome,
    categoria: produto.categoria?.nome,
    preco: produto.preco,
    quantidadeEstoque: produto.quantidadeEstoque,
    estoqueMinimo: produto.estoqueMinimo,
    statusEstoque: produto.statusEstoque,
  }));

  res.json(resultado);
};

// GET /api/estoque/:produtoId - estoque de um único produto
const obterEstoqueProduto = async (req, res) => {
  const produto = await Produto.findById(req.params.produtoId);
  if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

  res.json({
    id: produto._id,
    nome: produto.nome,
    quantidadeEstoque: produto.quantidadeEstoque,
    estoqueMinimo: produto.estoqueMinimo,
    statusEstoque: produto.statusEstoque,
  });
};

module.exports = { listarEstoque, obterEstoqueProduto };
