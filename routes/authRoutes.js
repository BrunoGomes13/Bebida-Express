const express = require('express');
const { login, meuPerfil } = require('../controllers/authController');
const protegerRota = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', protegerRota, meuPerfil);

module.exports = router;