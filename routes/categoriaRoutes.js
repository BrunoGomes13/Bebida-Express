const express = require('express');
const protegerRota = require('../middleware/authMiddleware');
const {
  criarCategoria,
  listarCategorias,
  obterCategoria,
  atualizarCategoria,
  removerCategoria,
} = require('../controllers/categoriaController');

const router = express.Router();

router.use(protegerRota); // todas as rotas abaixo exigem administrador logado

router.route('/').post(criarCategoria).get(listarCategorias);
router.route('/:id').get(obterCategoria).put(atualizarCategoria).delete(removerCategoria);

module.exports = router;
