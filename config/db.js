const mongoose = require('mongoose');

let mongod; // Will hold the in-memory server instance if needed

const connectDB = async () => {
    try {
        // First, try connecting to the MongoDB URI in .env
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000 // Fail fast if local MongoDB isn't running
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        // If local MongoDB is not running, use in-memory MongoDB
        console.warn('⚠️  Local MongoDB not available. Starting in-memory MongoDB...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('✅ Connected to in-memory MongoDB');
            console.log('   Note: Data will be lost when the server stops.');
        } catch (memErr) {
            console.error('❌ Could not start any MongoDB instance:', memErr.message);
            console.warn('The app will run without database features.');
        }
    }
};

module.exports = connectDB;
