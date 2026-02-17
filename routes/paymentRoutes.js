const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Stripe PaymentIntent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

module.exports = router;
