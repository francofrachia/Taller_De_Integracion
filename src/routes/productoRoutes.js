const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarToken = require('../middlewares/authMiddleware');

// La ruta será: http://localhost:3000/api/productos
router.get('/', productoController.getProductos);
router.get('/categorias', productoController.getCategorias);
router.get('/:id', productoController.getProductoById);
router.get('/:id/resenas', productoController.getResenasByProductoId);

// Guardar/Actualizar calificación e insertar reseña opcional
router.post('/:id/calificar', verificarToken, productoController.calificarProducto);

module.exports = router;