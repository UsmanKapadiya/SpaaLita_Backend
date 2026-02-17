const mongoose = require('mongoose');

const bookingPolicySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    buttonUrl: {
      type: String,
      required: [true, 'Please provide a button URL'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BookingPolicy', bookingPolicySchema);
