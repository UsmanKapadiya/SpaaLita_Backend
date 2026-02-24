const mongoose = require('mongoose');

const monthlySpecialSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    image: {
      type: String, // URL or file path
      required: [true, 'Please provide an image'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MonthlySpecial', monthlySpecialSchema);
