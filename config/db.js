const mongoose = require('mongoose');

// Cache the connection using a global variable so it persists
// across warm serverless invocations on Vercel
let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, return immediately
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Reset if previous connection failed
    if (mongoose.connection.readyState === 0) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const mongoURI = process.env.MONGO_URI;
        const isVercel = !!process.env.VERCEL;

        if (isVercel && (!mongoURI || mongoURI.includes('localhost'))) {
            // On Vercel without a cloud DB — fail fast instead of waiting
            console.error('❌ MONGO_URI not configured for Vercel. Set it in Environment Variables.');
            return null;
        }

        if (!mongoURI || mongoURI.includes('localhost')) {
            // Local development — try local MongoDB, then fall back to in-memory
            try {
                cached.promise = mongoose.connect(mongoURI || 'mongodb://localhost:27017/nike-ecommerce', {
                    serverSelectionTimeoutMS: 2000
                });
                cached.conn = await cached.promise;
                console.log('✅ Connected to local MongoDB');
                return cached.conn;
            } catch (err) {
                cached.promise = null;
                console.warn('⚠️  Local MongoDB not available. Starting in-memory MongoDB...');
                try {
                    const { MongoMemoryServer } = require('mongodb-memory-server');
                    const mongod = await MongoMemoryServer.create();
                    cached.promise = mongoose.connect(mongod.getUri());
                    cached.conn = await cached.promise;
                    console.log('✅ Connected to in-memory MongoDB');
                    return cached.conn;
                } catch (memErr) {
                    console.error('❌ Could not start any MongoDB instance:', memErr.message);
                    cached.promise = null;
                    return null;
                }
            }
        }

        // Cloud MongoDB (Atlas) — used on Vercel
        cached.promise = mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('✅ Connected to MongoDB Atlas');
        return cached.conn;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        cached.conn = null;
        return null;
    }
};

module.exports = connectDB;
