const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// La ruta será: http://localhost:3000/api/productos
router.get('/', productoController.getProductos);

module.exports = router;