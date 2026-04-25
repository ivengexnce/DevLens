const mongoose = require('mongoose');

const connectDB = async() => {
    if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not set — running without database (caching disabled)');
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.warn('   Continuing without database — analytics will not be stored.');
    }
};

module.exports = connectDB;