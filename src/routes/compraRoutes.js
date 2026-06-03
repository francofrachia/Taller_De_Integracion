const express = require('express');
const router = express.Router();
const { getComprasUsuario, getAllCompras, updateCompraEstado } = require('../controllers/compraController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

// Ruta protegida para traer las compras del usuario
router.get('/', verificarToken, getComprasUsuario);

// --- Rutas de Administrador ---
router.get('/admin', verificarToken, verificarAdmin, getAllCompras);
router.put('/admin/:id/estado', verificarToken, verificarAdmin, updateCompraEstado);

module.exports = router;
