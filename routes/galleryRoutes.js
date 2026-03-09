const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/authenticateToken');

const {
  uploadImages,
  getGalleryImages,
  deleteGalleryImage,
  updateGallery
} = require('../controllers/galleryController');

// CRUD Routes
router.get('/', getGalleryImages);
router.post('/create', authenticateToken, upload.array('images', 10), uploadImages);
router.put('/:id', authenticateToken, upload.single('image'), updateGallery);
router.delete('/:id', deleteGalleryImage);

module.exports = router;