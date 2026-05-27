const express = require('express');
const router = express.Router();
const { loginOauth, updateProfile, registerUser, loginUser } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/google-login', loginOauth);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', verificarToken, updateProfile); // Protegido por JWT

module.exports = router;