const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');

router.get('/', favoritoController.getFavoritos);
router.post('/', favoritoController.addFavorito);
router.delete('/', favoritoController.removeFavorito);

module.exports = router;
