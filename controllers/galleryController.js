const Gallery = require('../models/Gallery');

// Upload single or multiple images in one API
const uploadImages = async (req, res) => {
  try {
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files;
    } else if (req.file) {
      files = [req.file];
    }
    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }
    const imagePaths = files.map(file => '/uploads/' + file.filename);
    const gallery = new Gallery({ images: imagePaths });
    await gallery.save();
    res.status(201).json({ success: true, message: 'Image(s) uploaded successfully', data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading image(s)', error: error.message });
  }
};

// Get all gallery images
const getGalleryImages = async (req, res) => {
  try {
    const galleries = await Gallery.find();
    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching gallery images', error: error.message });
  }
};

// Delete gallery image by gallery document id
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findByIdAndDelete(id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery image not found' });
    }
    res.status(200).json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting gallery image', error: error.message });
  }
};

module.exports = {
  uploadImages,
  getGalleryImages,
  deleteGalleryImage,
};
