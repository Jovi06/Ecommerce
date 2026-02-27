const Product = require('../../models/Product');

// ──────────────────────────────────────────────
// GET /api/products
// ──────────────────────────────────────────────
// Get all products. Supports optional query params:
//   ?category=running    → filter by category
//   ?sort=price-asc      → sort by price ascending
//   ?sort=price-desc     → sort by price descending
//
// Response:
//   { "success": true, "count": 15, "products": [...] }
// ──────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
    try {
        const { category, sort } = req.query;
        let filter = {};
        if (category) filter.category = category;

        // Build sort option
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;  // Default: newest first

        const products = await Product.find(filter).sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error('Get all products error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// GET /api/products/:category
// ──────────────────────────────────────────────
// Get products by gender category (men, women, kids).
//
// URL params:
//   :category → "men", "women", or "kids"
//
// Optional query params:
//   ?category=running    → filter by sub-category
//   ?sort=price-asc      → sort by price
//
// Response:
//   { "success": true, "count": 5, "products": [...] }
// ──────────────────────────────────────────────
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;  // men, women, or kids

        // Validate category
        const validCategories = ['men', 'women', 'kids'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Use: men, women, or kids.'
            });
        }

        const { category: subCategory, sort } = req.query;
        let filter = { gender: category };
        if (subCategory) filter.category = subCategory;

        // Build sort option
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        const products = await Product.find(filter).sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error('Get products by category error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// GET /api/product/:id
// ──────────────────────────────────────────────
// Get a single product by its ID.
//
// Response:
//   { "success": true, "product": { ... } }
// ──────────────────────────────────────────────
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (err) {
        console.error('Get product by ID error:', err);
        // Handle invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};
