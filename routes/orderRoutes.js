
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  handleStripeWebhook,
} = require('../controllers/orderController');

// Apply token authentication to all order routes except webhook
router.use(authenticateToken);

// Create order and payment intent
router.post('/', createOrder);
// Get orders (admin or user)
router.get('/', getOrders);
// Update order status (admin)
router.put('/:id/status', updateOrderStatus);
// Update order (admin)
router.put('/:id', updateOrder);
// Delete order (admin)
router.delete('/:id', deleteOrder);

// Stripe webhook (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
