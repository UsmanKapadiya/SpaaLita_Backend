const Gallery = require('../models/Gallery');


// Convert file buffer to base64
const bufferToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// Upload images
exports.uploadImages = async (req, res) => {
  try {
    const files = req.files; // multer stores uploaded files in req.files
    const galleryDocs = files.map(file => ({
      url: `/uploads/${file.filename}` // store path to file
    }));

    const savedImages = await Gallery.insertMany(galleryDocs);

    res.status(201).json({ message: 'Images uploaded successfully', data: savedImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
};

// Get gallery images for a specific date
exports.getGalleryImages = async (req, res) => {
  try {
    const { date } = req.query; // expecting format 'dd-mm-yyyy'

    let filter = {};

    if (date) {
      // Convert 'dd-mm-yyyy' to Date range
      const [day, month, year] = date.split('-');
      const start = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      const end = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching gallery' });
  }
};

// Delete gallery image by ID
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Gallery.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Image not found' });
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting image' });
  }
};

// Update an existing gallery image by ID
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images provided for update.' });

    const newUrl = bufferToBase64(req.files[0]);
    const updated = await Gallery.findByIdAndUpdate(id, { url: newUrl }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Image not found' });

    res.status(200).json({ message: 'Image updated successfully', data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating image' });
  }
};