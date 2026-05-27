const express = require('express');
const router = express.Router();
const { loginOauth, updateProfile } = require('../controllers/authController');
router.post('/google-login', loginOauth);
router.put('/profile', updateProfile);

module.exports = router;