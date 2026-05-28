const express = require('express');
const router = express.Router();
const { getComprasUsuario } = require('../controllers/compraController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta protegida para traer las compras del usuario
router.get('/', verificarToken, getComprasUsuario);

module.exports = router;
