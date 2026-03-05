require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

// ──────────────────────────────────────────────
// Import EJS Routes (existing server-rendered pages)
// ──────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ──────────────────────────────────────────────
// Import API Routes (new JSON API endpoints)
// ──────────────────────────────────────────────
const apiAuthRoutes = require('./routes/api/authRoutes');
const apiProductRoutes = require('./routes/api/productRoutes');
const apiCartRoutes = require('./routes/api/cartRoutes');
const apiOrderRoutes = require('./routes/api/orderRoutes');

const app = express();

// ──────────────────────────────────────────────
// Auto-seed data (for auto-seeding on first request)
// ──────────────────────────────────────────────
const Product = require('./models/Product');
const { products: sampleProducts } = require('./seed');

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

// CORS — allows frontend on a different port to call the API
app.use(cors());

// View engine (for EJS pages)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sessions (for EJS pages — not used by API routes)
app.use(session({
    secret: process.env.SESSION_SECRET || 'nike-default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Make user available to all EJS views
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
    next();
});

// ──────────────────────────────────────────────
// Database connection middleware
// Uses global flag to persist across warm Vercel invocations
// ──────────────────────────────────────────────
app.use(async (req, res, next) => {
    if (!global._dbReady) {
        const conn = await connectDB();
        if (conn) {
            // Auto-seed products if the database is empty
            try {
                const count = await Product.countDocuments();
                if (count === 0) {
                    await Product.insertMany(sampleProducts);
                    console.log('🎉 Auto-seeded 15 sample products into the database.');
                }
            } catch (err) {
                // Silently skip if DB isn't connected
            }
            global._dbReady = true;
        }
        // If conn is null, continue without DB — pages will show empty state
    }
    next();
});

// ──────────────────────────────────────────────
// API Routes (JSON responses, JWT auth)
// ──────────────────────────────────────────────
app.use('/api', apiAuthRoutes);
app.use('/api', apiProductRoutes);
app.use('/api', apiCartRoutes);
app.use('/api', apiOrderRoutes);

// ──────────────────────────────────────────────
// EJS Routes (existing server-rendered pages)
// ──────────────────────────────────────────────
app.use('/', shopRoutes);
app.use('/', authRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', adminRoutes);

// ──────────────────────────────────────────────
// 404 Handler
// ──────────────────────────────────────────────
app.use((req, res) => {
    // If the request is for an API route, return JSON
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found.'
        });
    }
    // Otherwise render the 404 EJS page
    res.status(404).render('404', {
        title: 'Page Not Found',
        user: req.session.user || null,
        cartCount: req.session.cart ? req.session.cart.length : 0
    });
});

// ──────────────────────────────────────────────
// Global Error Handler (prevents function crash)
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
    res.status(500).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;">
        <h1>Something went wrong</h1>
        <p>${process.env.VERCEL ? 'Please try again later.' : err.message}</p>
        <a href="/">Go Home</a>
        </body></html>
    `);
});

// ──────────────────────────────────────────────
// Start Server (only when running locally, not on Vercel)
// ──────────────────────────────────────────────
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Nike server running at http://localhost:${PORT}`);
        console.log(`API endpoints available at http://localhost:${PORT}/api`);
    });
}

// Export for Vercel serverless function
module.exports = app;
