const express = require('express');
const router = express.Router();
const { loginOauth, updateProfile, registerUser, loginUser, updateAvatar, updatePassword } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/google-login', loginOauth);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', verificarToken, updateProfile); // Protegido por JWT
router.put('/avatar', verificarToken, updateAvatar);   // Protegido por JWT
router.put('/password', verificarToken, updatePassword); // Protegido por JWT

module.exports = router;