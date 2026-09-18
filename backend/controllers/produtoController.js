const Produto = require('../models/Produto');

const criarProduto = async (req, res) => {
  try {
    const produto = await Produto.create(req.body);
    res.status(201).json(produto);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

// Suporta filtros opcionais: ?categoria=<id>&status=ativo&busca=coca
const listarProdutos = async (req, res) => {
  try {
    const { categoria, status, busca } = req.query;
    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (status) filtro.status = status;
    if (busca) filtro.nome = { $regex: busca, $options: 'i' };

    const produtos = await Produto.find(filtro).populate('categoria', 'nome').sort({ nome: 1 });
    res.json(produtos);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

const obterProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id).populate('categoria', 'nome');
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json(produto);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categoria', 'nome');
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json(produto);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

// Inativação lógica em vez de exclusão física (preserva o histórico de vendas)
const removerProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { status: 'inativo' },
      { new: true }
    );
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json({ mensagem: 'Produto inativado com sucesso.', produto });
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  obterProduto,
  atualizarProduto,
  removerProduto,
};
