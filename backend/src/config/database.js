const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  No MONGODB_URI set — running without database (in-memory mode)');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('   App will continue without database.');
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
