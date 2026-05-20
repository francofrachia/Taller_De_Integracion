const express = require('express');
const router = express.Router();
const { createPreference, receiveWebhook } = require('../controllers/mercadoPagoController');

// Ruta para crear preferencia de pago
router.post('/create_preference', createPreference);

// Ruta para recibir notificaciones de webhook de Mercado Pago
router.post('/webhook', receiveWebhook);

module.exports = router;
