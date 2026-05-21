const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.getCarrito);
router.post('/add', carritoController.addProducto);
router.put('/update', carritoController.updateCantidad);
router.post('/remove', carritoController.removeProducto);
router.post('/clear', carritoController.clearCarrito);

module.exports = router;
