const express = require('express');
const router = express.Router();
const {
    getDireccion,
    getLocalidades,
    saveDireccion,
    deleteDireccion
} = require('../controllers/direccionController');

router.get('/', getDireccion);              // GET /api/direccion?id_usuario=X
router.get('/localidades', getLocalidades); // GET /api/direccion/localidades
router.post('/', saveDireccion);            // POST /api/direccion
router.delete('/', deleteDireccion);        // DELETE /api/direccion

module.exports = router;
