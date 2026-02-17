const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addBookingPolicy,
  updateBookingPolicy,
  deleteBookingPolicy,
  getBookingPolicies,
  getBookingPolicy,
} = require('../controllers/bookingPolicyController');

// Apply token authentication to all booking policy routes
router.use(authenticateToken);

// Add booking policy
router.post('/', addBookingPolicy);
// Update booking policy
router.put('/:id', updateBookingPolicy);
// Delete booking policy
router.delete('/:id', deleteBookingPolicy);
// Get all booking policies
router.get('/', getBookingPolicies);
// Get single booking policy
router.get('/:id', getBookingPolicy);

module.exports = router;
