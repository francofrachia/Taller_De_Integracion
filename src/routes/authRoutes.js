const express = require('express');
const router = express.Router();
const { loginOauth, updateProfile } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/google-login', loginOauth);
router.put('/profile', verificarToken, updateProfile); // Protegido por JWT

module.exports = router;