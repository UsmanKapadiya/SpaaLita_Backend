const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addMonthlySpecial,
  updateMonthlySpecial,
  deleteMonthlySpecial,
  getMonthlySpecial,
  getMonthlySpecialByID,
} = require('../controllers/monthlySpecialController');

// Apply token authentication to all monthly special routes
// router.use(authenticateToken);

// Add monthly special
router.post('/', authenticateToken, addMonthlySpecial);
// Update monthly special
router.put('/:id', authenticateToken, updateMonthlySpecial);
// Delete monthly special
router.delete('/:id', authenticateToken, deleteMonthlySpecial);
// Get monthly special (the only one)
router.get('/', getMonthlySpecial);
router.get('/:id', getMonthlySpecialByID);

module.exports = router;
