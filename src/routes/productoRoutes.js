const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const multer = require('multer');

// Configuración de multer en memoria (los archivos se pasan como buffers a sharp)
const upload = multer({ storage: multer.memoryStorage() });

// La ruta será: http://localhost:3000/api/productos
router.get('/', productoController.getProductos);
router.get('/promociones', productoController.getPromociones);
router.get('/categorias', productoController.getCategorias);

// --- Rutas de Administrador ---
router.get('/admin', verificarToken, verificarAdmin, productoController.getProductosAdmin);

router.get('/:id', productoController.getProductoById);
router.get('/:id/resenas', productoController.getResenasByProductoId);

// Guardar/Actualizar calificación e insertar reseña opcional
router.post('/:id/calificar', verificarToken, productoController.calificarProducto);

// Obtener elegibilidad de calificación del usuario para un producto
router.get('/:id/elegibilidad-resena', verificarToken, productoController.checkReviewEligibility);

// --- Más Rutas de Administrador ---
router.post('/', verificarToken, verificarAdmin, upload.array('imagenes', 5), productoController.createProducto);
router.put('/:id', verificarToken, verificarAdmin, upload.array('imagenes', 5), productoController.updateProducto);
router.delete('/:id', verificarToken, verificarAdmin, productoController.deleteProducto);

router.get('/categorias/admin', verificarToken, verificarAdmin, productoController.getAllCategoriasAdmin);
router.post('/categorias/admin', verificarToken, verificarAdmin, productoController.createCategoria);
router.put('/categorias/admin/:id', verificarToken, verificarAdmin, productoController.updateCategoria);
router.delete('/categorias/admin/:id', verificarToken, verificarAdmin, productoController.deleteCategoria);

module.exports = router;