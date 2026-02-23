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

// Apply token authentication only to protected routes
router.post('/', authenticateToken, addBookingPolicy);
router.put('/:id', authenticateToken, updateBookingPolicy);
router.delete('/:id', authenticateToken, deleteBookingPolicy);

// Get all booking policies (public)
router.get('/', getBookingPolicies);
// Get single booking policy (public)
router.get('/:id', getBookingPolicy);

module.exports = router;
