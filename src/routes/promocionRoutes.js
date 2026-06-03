const express = require('express');
const router = express.Router();
const promocionController = require('../controllers/promocionController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

// Solo administradores pueden gestionar promociones a nivel global (CRUD)
router.get('/', verificarToken, verificarAdmin, promocionController.getAllPromociones);
router.post('/', verificarToken, verificarAdmin, promocionController.createPromocion);
router.put('/:id', verificarToken, verificarAdmin, promocionController.updatePromocion);
router.delete('/:id', verificarToken, verificarAdmin, promocionController.deletePromocion);

module.exports = router;
