const mongoose = require('mongoose');
require('dotenv').config();

async function connectMongo() {
  try {
    if (!process.env.MONGO_CONNECT_URL) {
      throw new Error('MONGO_CONNECT_URL not found.');
    }
    await mongoose.connect(process.env.MONGO_CONNECT_URL);
    console.info('MongoDB connected successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

module.exports = {
  connectMongo,
};
