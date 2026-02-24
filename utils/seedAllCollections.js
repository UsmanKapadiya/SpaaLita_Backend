const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Role = require('../models/Role');
const Order = require('../models/Order');
const GiftCard = require('../models/GiftCard');
const Gallery = require('../models/Gallery');
const Contact = require('../models/Contact');
const BookingPolicy = require('../models/BookingPolicy');
const MonthlySpecial = require('../models/MonthlySpecial');

async function seedAllCollections() {
  await mongoose.connect(MONGODB_URI);

  // Admin
  const adminPassword = await bcrypt.hash('Admin@321', 10);
  await Admin.findOneAndUpdate(
    { username: 'admin' },
    {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // User
  const userPassword = await bcrypt.hash('User@123', 10);
  await User.findOneAndUpdate(
    { userName: 'user1' },
    {
      userName: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'user1@example.com',
      phone: '1234567890',
      country: 'Country',
      city: 'City',
      address: '123 Main St',
      postalCode: '12345',
      password: userPassword,
      role: 'user',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // Product
  await Product.findOneAndUpdate(
    { sku: 'SKU001' },
    {
      productName: 'Sample Product',
      sku: 'SKU001',
      price: 99.99,
      qty: 10,
      productImages: [],
      description: 'Sample product description',
      category: 'Sample Category',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // Service
  await Service.findOneAndUpdate(
    { serviceName: 'Sample Service' },
    {
      serviceName: 'Sample Service',
      serviceImage: '/uploads/sample.jpg',
      serviceDescription: 'Sample service description',
      buttonUrl: 'https://example.com',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // Role
  await Role.findOneAndUpdate(
    { name: 'admin' },
    {
      name: 'admin',
      description: 'Administrator role',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // Order
  // Note: Order needs valid user and product references
  const user = await User.findOne({ userName: 'user1' });
  const product = await Product.findOne({ sku: 'SKU001' });
  if (user && product) {
    await Order.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        items: [{ productId: product._id, name: product.productName, price: product.price, qty: 1, image: '' }],
        totalAmount: product.price,
        status: 'pending',
        paymentIntentId: '',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        shippingAddress: { name: 'John Doe', address: '123 Main St', city: 'City', country: 'Country', email: 'user1@example.com', phone: '1234567890' },
        billingAddress: { name: 'John Doe', address: '123 Main St', city: 'City', country: 'Country', email: 'user1@example.com', phone: '1234567890' },
      },
      { upsert: true, new: true }
    );
  }

  // GiftCard
  await GiftCard.findOneAndUpdate(
    { sku: 'GIFT001' },
    {
      productName: 'Sample Gift Card',
      sku: 'GIFT001',
      price: 50,
      qty: 5,
      productImages: [],
      description: 'Sample gift card description',
      category: 'Gift',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // Gallery
  await Gallery.findOneAndUpdate(
    { images: ['/uploads/sample.jpg'] },
    {
      images: ['/uploads/sample.jpg'],
    },
    { upsert: true, new: true }
  );

  // Contact
  await Contact.findOneAndUpdate(
    { email: 'contact@example.com' },
    {
      name: 'Contact Name',
      email: 'contact@example.com',
      phone: '9876543210',
      address: '456 Main St',
      subject: 'Sample Subject',
      message: 'Sample message',
    },
    { upsert: true, new: true }
  );

  // BookingPolicy
  await BookingPolicy.findOneAndUpdate(
    { title: 'Sample Policy' },
    {
      title: 'Sample Policy',
      description: 'Sample booking policy description',
      buttonUrl: 'https://example.com/policy',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  // MonthlySpecial
  await MonthlySpecial.findOneAndUpdate(
    { title: 'Sample Special' },
    {
      title: 'Sample Special',
      image: '/uploads/sample.jpg',
    },
    { upsert: true, new: true }
  );

  console.log('Seeded all collections with sample data.');
  process.exit(0);
}

seedAllCollections().catch(err => {
  console.error(err);
  process.exit(1);
});
