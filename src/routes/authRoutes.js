const express = require('express');
const router = express.Router();
const { loginOauth } = require('../controllers/authController');
router.post('/google-login', loginOauth);

module.exports = router;