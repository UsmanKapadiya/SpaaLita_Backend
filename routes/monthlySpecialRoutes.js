const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addMonthlySpecial,
  updateMonthlySpecial,
  deleteMonthlySpecial,
  getMonthlySpecial,
} = require('../controllers/monthlySpecialController');

// Apply token authentication to all monthly special routes
router.use(authenticateToken);

// Add monthly special
router.post('/', addMonthlySpecial);
// Update monthly special
router.put('/:id', updateMonthlySpecial);
// Delete monthly special
router.delete('/:id', deleteMonthlySpecial);
// Get monthly special (the only one)
router.get('/', getMonthlySpecial);

module.exports = router;
