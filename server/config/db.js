const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('📡 Attempting MongoDB connection...');
    console.log('🔌 MONGO_URI exists:', !!process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    // Log first 50 chars of URI for debugging (safely)
    const uriPreview = process.env.MONGO_URI.substring(0, 50) + '...';
    console.log('📝 Connecting to:', uriPreview);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      retryWrites: true,
      w: 'majority',
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed!`);
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Full Stack:`, error);
    throw error;
  }
};

module.exports = connectDB;
