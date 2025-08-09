// Simple MongoDB connection test
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log(
  'MongoDB URI (masked):',
  MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')
);

async function testConnection() {
  try {
    console.log('Attempting to connect...');

    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('Database name:', connection.connection.db?.databaseName);
    console.log('Connection state:', mongoose.connection.readyState);

    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);

    const testDoc = new TestModel({ test: 'connection test' });
    await testDoc.save();
    console.log('✅ Successfully created test document');

    // Clean up
    await TestModel.deleteOne({ test: 'connection test' });
    console.log('✅ Successfully deleted test document');

    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);

    if (error.message.includes('authentication failed')) {
      console.error('\n🔍 Authentication Issue:');
      console.error('- Check if username and password are correct');
      console.error('- Verify the user exists in MongoDB Atlas');
      console.error(
        '- Ensure the user has read/write permissions to the database'
      );
      console.error('- Check if IP address is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔍 Network Issue:');
      console.error('- Check if the cluster URL is correct');
      console.error('- Verify internet connection');
    }

    process.exit(1);
  }
}

testConnection();
