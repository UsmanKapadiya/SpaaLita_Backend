const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    profilePicture: { type: String, default: '' },
    userName: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    
    billing: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      country: String,
      state: String,
      city: String,
      postcode: String,
      phone: String,
      email: String,
    },
    shipping: {
      firstName: String,
      lastName: String,
      address1: String,
      address2: String,
      country: String,
      state: String,
      city: String,
      postcode: String,
      giftCard: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);