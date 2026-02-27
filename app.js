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

// Connect to MongoDB and auto-seed if empty
const Product = require('./models/Product');
const { products: sampleProducts } = require('./seed');

(async () => {
    await connectDB();
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
})();

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
// API Routes (JSON responses, JWT auth)
// ──────────────────────────────────────────────
// These are the new routes your frontend can
// call using fetch() or axios.
//
// Example:
//   fetch("/api/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password })
//   })
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
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nike server running at http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
