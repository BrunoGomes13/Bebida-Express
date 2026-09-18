const Produto = require('../models/Produto');

// GET /api/estoque - visão geral do estoque de todos os produtos ativos
const listarEstoque = async (req, res) => {
  try {
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
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

// GET /api/estoque/:produtoId - estoque de um único produto
const obterEstoqueProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.produtoId);
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

    res.json({
      id: produto._id,
      nome: produto.nome,
      quantidadeEstoque: produto.quantidadeEstoque,
      estoqueMinimo: produto.estoqueMinimo,
      statusEstoque: produto.statusEstoque,
    });
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

module.exports = { listarEstoque, obterEstoqueProduto };
