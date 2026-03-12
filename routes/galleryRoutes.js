const express = require('express');
const router = express.Router();
// const upload = require('../middleware/upload');
const createUpload = require('../middleware/upload');
const uploadGallery = createUpload('gallery');
const authenticateToken = require('../middleware/authenticateToken');

const {
  uploadImages,
  getGalleryImages,
  deleteGalleryImage,
  updateGallery
} = require('../controllers/galleryController');

// CRUD Routes
router.get('/', getGalleryImages);
// router.post('/create', authenticateToken, upload.array('images', 10), uploadImages);
router.post('/create', authenticateToken, uploadGallery.array('images', 10), uploadImages);
// router.put('/:id', authenticateToken, upload.single('image'), updateGallery);
router.put('/:id', authenticateToken, uploadGallery.single('image'), updateGallery);
router.delete('/:id', deleteGalleryImage);

module.exports = router;