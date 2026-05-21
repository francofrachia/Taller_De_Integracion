const express = require('express');
const router = express.Router();
const { 
    createPreference, 
    receiveWebhook,
    successRedirect,
    failureRedirect,
    pendingRedirect
} = require('../controllers/mercadoPagoController');

// Ruta para crear preferencia de pago
router.post('/create_preference', createPreference);

// Ruta para recibir notificaciones de webhook de Mercado Pago
router.post('/webhook', receiveWebhook);

// Rutas de redirección proxy (intermediario ngrok a localhost)
router.get('/success-redirect', successRedirect);
router.get('/failure-redirect', failureRedirect);
router.get('/pending-redirect', pendingRedirect);

module.exports = router;
