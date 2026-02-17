const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    serviceImage: {
      type: String, // URL or file path
      required: [true, 'Please provide a service image'],
    },
    serviceDescription: {
      type: String,
      required: [true, 'Please provide a service description'],
    },
    buttonUrl: {
      type: String,
      required: [true, 'Please provide a button URL'],
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

module.exports = mongoose.model('Service', serviceSchema);
