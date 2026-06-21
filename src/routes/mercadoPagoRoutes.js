const express = require('express');
const router = express.Router();
const { 
    createPreference, 
    receiveWebhook,
    successRedirect,
    failureRedirect,
    pendingRedirect,
    procesarPagoFallidoEndpoint
} = require('../controllers/mercadoPagoController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta para crear preferencia de pago (Protegida)
router.post('/create_preference', verificarToken, createPreference);

// Ruta para recibir notificaciones de webhook de Mercado Pago
router.post('/webhook', receiveWebhook);

// Ruta para procesar un pago fallido reportado por el cliente
router.post('/procesar-pago-fallido', verificarToken, procesarPagoFallidoEndpoint);

// Rutas de redirección proxy (intermediario ngrok a localhost)
router.get('/success-redirect', successRedirect);
router.get('/failure-redirect', failureRedirect);
router.get('/pending-redirect', pendingRedirect);

module.exports = router;
