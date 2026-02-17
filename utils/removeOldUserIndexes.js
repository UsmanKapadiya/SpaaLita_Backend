const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function removeOldIndexes() {
  await mongoose.connect(MONGODB_URI);
  const collection = mongoose.connection.collection('users');
  const indexes = await collection.indexes();
  for (const idx of indexes) {
    if (idx.name === 'username_1') {
      console.log('Dropping old index: username_1');
      await collection.dropIndex('username_1');
    }
  }
  console.log('Done.');
  process.exit(0);
}

removeOldIndexes().catch(err => {
  console.error(err);
  process.exit(1);
});