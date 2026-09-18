const express = require('express');
const protegerRota = require('../middleware/authMiddleware');
const { registrarVenda, listarVendas, obterVenda } = require('../controllers/vendaController');

const router = express.Router();

router.use(protegerRota);

router.route('/').post(registrarVenda).get(listarVendas);
router.get('/:id', obterVenda);

module.exports = router;
