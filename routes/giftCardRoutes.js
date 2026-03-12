const express = require('express');
const router = express.Router();
const createUpload = require('../middleware/upload');
const uploadGiftCard = createUpload('products');
const authenticateToken = require('../middleware/authenticateToken');
const {
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getGiftCards,
  getGiftCard,
  getRelatedGiftCards,
} = require('../controllers/giftCardController');


// router.post('/', authenticateToken, upload.array('productImages', 10), addGiftCard);
router.post('/', authenticateToken, uploadGiftCard.array('productImages', 10), addGiftCard);


// router.put('/:id', authenticateToken,  upload.array('productImages', 10), updateGiftCard);
router.put('/:id', authenticateToken,  uploadGiftCard.array('productImages', 10), updateGiftCard);

router.delete('/:id', authenticateToken, deleteGiftCard);

// Get all gift cards (no token required)
router.get('/', getGiftCards);

// Get single gift card (no token required)
router.get('/:id', getGiftCard);

// Get related gift cards (no token required)
router.get('/:id/related', getRelatedGiftCards);


module.exports = router;
