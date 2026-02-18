const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number,
        image: String,
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      name: { type: String, default: '' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    billingAddress: {
      name: { type: String, default: '' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
