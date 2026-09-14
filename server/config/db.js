const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI is not defined in environment variables.");
      // We don't exit here so the server can still start for other routes, 
      // but DB queries will fail.
      return; 
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4 // Force IPv4 to fix Windows DNS issues
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
