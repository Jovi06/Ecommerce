const express = require('express');
const router = express.Router();
const productController = require('../../controllers/api/productController');

// ──────────────────────────────────────────────
// Product Routes (no authentication required)
// ──────────────────────────────────────────────

// GET /api/products → Get all products
router.get('/products', productController.getAllProducts);

// GET /api/products/:category → Get products by gender (men, women, kids)
router.get('/products/:category', productController.getProductsByCategory);

// GET /api/product/:id → Get a single product by ID
router.get('/product/:id', productController.getProductById);

module.exports = router;
