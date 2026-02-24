const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const Admin = require('../models/Admin');

async function setAdminCredentials() {
  await mongoose.connect(MONGODB_URI);
  const username = 'admin';
  const password = 'Admin@321';
  const email = 'admin@example.com'; // Change if needed

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert admin
  const admin = await Admin.findOneAndUpdate(
    { username },
    {
      username,
      password: hashedPassword,
      email,
      role: 'admin',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('Admin credentials set:', admin);
  process.exit(0);
}

setAdminCredentials().catch(err => {
  console.error(err);
  process.exit(1);
});
