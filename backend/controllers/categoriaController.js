const Categoria = require('../models/Categoria');

const criarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nome: 1 });
    res.json(categorias);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

const obterCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    res.json(categoria);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

const atualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!categoria) return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    res.json(categoria);
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

// Inativação lógica em vez de exclusão física (evita quebrar produtos já vinculados)
const removerCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { status: 'inativo' },
      { new: true }
    );
    if (!categoria) return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    res.json({ mensagem: 'Categoria inativada com sucesso.', categoria });
  } catch (erro) {
    res.status(400).json({ mensagem: erro.message });
  }
};

module.exports = {
  criarCategoria,
  listarCategorias,
  obterCategoria,
  atualizarCategoria,
  removerCategoria,
};
