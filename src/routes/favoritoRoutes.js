const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const verificarToken = require('../middlewares/authMiddleware');

// Proteger todas las rutas de favoritos con JWT
router.use(verificarToken);

router.get('/', favoritoController.getFavoritos);
router.post('/', favoritoController.addFavorito);
router.delete('/', favoritoController.removeFavorito);

module.exports = router;
