const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const {
    getDireccion,
    getLocalidades,
    saveDireccion,
    deleteDireccion
} = require('../controllers/direccionController');

router.get('/', verificarToken, getDireccion);              // GET /api/direccion (Protegido por JWT)
router.get('/localidades', getLocalidades);                 // GET /api/direccion/localidades (Público)
router.post('/', verificarToken, saveDireccion);            // POST /api/direccion (Protegido por JWT)
router.delete('/', verificarToken, deleteDireccion);        // DELETE /api/direccion (Protegido por JWT)

module.exports = router;
