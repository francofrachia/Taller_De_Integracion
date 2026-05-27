const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const verificarToken = require('../middlewares/authMiddleware');

// Proteger todas las rutas del carrito con verificación JWT
router.use(verificarToken);

router.get('/', carritoController.getCarrito);
router.post('/add', carritoController.addProducto);
router.put('/update', carritoController.updateCantidad);
router.post('/remove', carritoController.removeProducto);
router.post('/clear', carritoController.clearCarrito);

module.exports = router;
