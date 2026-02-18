const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const User = require('../models/User');

async function hashPlainPasswords() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find();
  for (const user of users) {
    // If password is not hashed (doesn't start with $2a$ or $2b$), hash it
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(user.password, 10);
      user.password = hashed;
      await user.save();
      console.log(`Updated password for user: ${user.email}`);
    }
  }
  console.log('Done.');
  process.exit(0);
}

hashPlainPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
