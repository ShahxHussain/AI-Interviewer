import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

async function connectDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return mongoose;
    }

    // Check if connecting
    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB connection in progress...');
      return mongoose;
    }

    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    // Connect to MongoDB with additional options
    const connection = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log('Successfully connected to MongoDB');
    console.log('Database name:', connection.connection.db?.databaseName);

    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('authentication failed')) {
        console.error(
          'Authentication failed. Please check your MongoDB credentials.'
        );
      } else if (error.message.includes('ENOTFOUND')) {
        console.error(
          'MongoDB server not found. Please check your connection string.'
        );
      } else if (error.message.includes('timeout')) {
        console.error(
          'Connection timeout. Please check your network connection.'
        );
      }
    }

    throw error;
  }
}

export default connectDB;
