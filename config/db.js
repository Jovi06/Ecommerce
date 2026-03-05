const mongoose = require('mongoose');

// Cache the connection promise so warm serverless invocations reuse it
let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI || mongoURI.includes('localhost')) {
            // In development without a cloud DB, try local or in-memory
            try {
                cached.promise = mongoose.connect(mongoURI || 'mongodb://localhost:27017/nike-ecommerce', {
                    serverSelectionTimeoutMS: 3000
                });
                cached.conn = await cached.promise;
                console.log('✅ Connected to local MongoDB');
                return cached.conn;
            } catch (err) {
                // Only use in-memory MongoDB in development (not on Vercel)
                if (!process.env.VERCEL) {
                    console.warn('⚠️  Local MongoDB not available. Starting in-memory MongoDB...');
                    try {
                        const { MongoMemoryServer } = require('mongodb-memory-server');
                        const mongod = await MongoMemoryServer.create();
                        cached.promise = mongoose.connect(mongod.getUri());
                        cached.conn = await cached.promise;
                        console.log('✅ Connected to in-memory MongoDB');
                        console.log('   Note: Data will be lost when the server stops.');
                        return cached.conn;
                    } catch (memErr) {
                        console.error('❌ Could not start any MongoDB instance:', memErr.message);
                        cached.promise = null;
                        return null;
                    }
                } else {
                    console.error('❌ No MONGO_URI configured for production.');
                    cached.promise = null;
                    return null;
                }
            }
        } else {
            // Cloud MongoDB (Atlas) — used on Vercel
            cached.promise = mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 5000
            });
        }
    }

    try {
        cached.conn = await cached.promise;
        console.log('✅ Connected to MongoDB Atlas');
        return cached.conn;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        return null;
    }
};

module.exports = connectDB;
