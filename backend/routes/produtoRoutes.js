const express = require('express');
const protegerRota = require('../middleware/authMiddleware');
const {
  criarProduto,
  listarProdutos,
  obterProduto,
  atualizarProduto,
  removerProduto,
} = require('../controllers/produtoController');

const router = express.Router();

router.use(protegerRota);

router.route('/').post(criarProduto).get(listarProdutos);
router.route('/:id').get(obterProduto).put(atualizarProduto).delete(removerProduto);

module.exports = router;
