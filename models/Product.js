const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide a SKU'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
    qty: {
      type: Number,
      required: [true, 'Please provide quantity'],
    },
    productImages: [
      {
        type: String, // URL or file path
      }
    ],
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
