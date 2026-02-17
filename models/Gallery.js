const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    images: [
      {
        type: String, // URL or file path
        required: true
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
