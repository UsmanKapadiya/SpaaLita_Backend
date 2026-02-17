const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String, // URL or file path
      default: '',
    },
    userName: {
      type: String,
      required: [true, 'Please provide a user name'],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide a postal code'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    role: {
      type: String,
      default: 'user',
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

module.exports = mongoose.model('User', userSchema);
