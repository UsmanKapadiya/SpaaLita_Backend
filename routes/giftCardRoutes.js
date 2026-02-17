const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getGiftCards,
  getGiftCard,
  getRelatedGiftCards,
} = require('../controllers/giftCardController');

// Apply token authentication to all gift card routes
router.use(authenticateToken);

// Add gift card
router.post('/', addGiftCard);
// Update gift card
router.put('/:id', updateGiftCard);
// Delete gift card
router.delete('/:id', deleteGiftCard);
// Get all gift cards
router.get('/', getGiftCards);
// Get single gift card
router.get('/:id', getGiftCard);
// Get related gift cards
router.get('/:id/related', getRelatedGiftCards);

module.exports = router;
