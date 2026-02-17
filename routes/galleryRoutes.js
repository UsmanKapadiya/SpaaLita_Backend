const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload');
const {
  uploadImages,
  getGalleryImages,
  deleteGalleryImage,
} = require('../controllers/galleryController');

// Apply token authentication to all gallery routes
router.use(authenticateToken);

// Upload single or multiple images (use 'image' for single, 'images' for multiple)
router.post('/upload', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), uploadImages);
// Get all gallery images
router.get('/', getGalleryImages);
// Delete gallery image by gallery document id
router.delete('/:id', deleteGalleryImage);

module.exports = router;
