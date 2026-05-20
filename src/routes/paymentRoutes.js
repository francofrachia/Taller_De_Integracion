const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payments/create-preference
router.post('/create-preference', paymentController.createPreference);

// POST /api/payments/webhook-mp
router.post('/webhook-mp', paymentController.receiveWebhook);

module.exports = router;
