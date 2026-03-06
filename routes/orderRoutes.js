
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const optionalAuth = require('../middleware/optionalAuth');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  handleStripeWebhook,
} = require('../controllers/orderController');

// Create order (guest + logged user)
router.post('/', optionalAuth, createOrder);

// Get orders (only logged users/admin)
router.get('/', authenticateToken, getOrders);

// Update order status (admin)
router.put('/:id/status', authenticateToken, updateOrderStatus);

// Update order (admin)
router.put('/:id', authenticateToken, updateOrder);

// Delete order (admin)
router.delete('/:id', authenticateToken, deleteOrder);

// Stripe webhook (no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
