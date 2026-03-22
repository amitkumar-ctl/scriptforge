const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('✅ MongoDB connected');
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = { connectDB, mongoose };