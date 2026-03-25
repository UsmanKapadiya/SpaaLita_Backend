const mongoose = require('mongoose');
const User = require('./models/User'); // adjust path to your User model

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Initial data
const INITIAL_BILLING_DETAILS = {
  firstName: 'John',
  lastName: 'Doe',
  address1: '123 Test St',
  address2: '',
  country: 'CA',
  state: 'ON',
  city: 'Toronto',
  postcode: 'M1M1M1',
  phone: '1234567890',
  email: 'john.doe@example.com'
};

const INITIAL_SHIPPING_DETAILS = {
  firstName: 'John',
  lastName: 'Doe',
  address1: '123 Test St',
  address2: '',
  country: 'CA',
  state: 'ON',
  city: 'Toronto',
  postcode: 'M1M1M1',
  giftCard: ''
};

async function seedUserBillingShipping() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const userId = '699c03586750ace820fda222'; // target user

    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with id ${userId} not found`);
      return;
    }

    user.billing = INITIAL_BILLING_DETAILS;
    user.shipping = INITIAL_SHIPPING_DETAILS;

    await user.save();
    console.log('User billing and shipping details seeded successfully');
  } catch (error) {
    console.error('Error seeding user billing/shipping:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedUserBillingShipping();