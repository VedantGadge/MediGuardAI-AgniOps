const mongoose = require('mongoose');

// Cache the database connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // If we have a cached connection and it's ready, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    // If a connection is already in progress, wait for it
    if (mongoose.connection.readyState === 2) {
      console.log('Waiting for existing connection...');
      await new Promise(resolve => {
        const checkConnection = setInterval(() => {
          if (mongoose.connection.readyState === 1) {
            clearInterval(checkConnection);
            resolve();
          } else if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
             clearInterval(checkConnection);
             throw new Error('Connection failed while waiting');
          }
        }, 100);
      });
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    console.log('Creating new MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false, // Disable buffering for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error; 
  }
};

module.exports = connectDB;
