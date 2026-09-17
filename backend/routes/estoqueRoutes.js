const express = require('express');
const protegerRota = require('../middleware/authMiddleware');
const { listarEstoque, obterEstoqueProduto } = require('../controllers/estoqueController');

const router = express.Router();

router.use(protegerRota);

router.get('/', listarEstoque);
router.get('/:produtoId', obterEstoqueProduto);

module.exports = router;
