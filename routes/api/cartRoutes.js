const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/api/cartController');
const auth = require('../../middleware/auth');

// ──────────────────────────────────────────────
// Cart Routes (all require JWT authentication)
// ──────────────────────────────────────────────

// GET /api/cart → Get user's cart
router.get('/cart', auth, cartController.getCart);

// POST /api/cart → Add item to cart
router.post('/cart', auth, cartController.addToCart);

// PUT /api/cart → Update item quantity
router.put('/cart', auth, cartController.updateCart);

// DELETE /api/cart/:productId → Remove item from cart
router.delete('/cart/:productId', auth, cartController.removeFromCart);

module.exports = router;
