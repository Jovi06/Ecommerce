const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/api/orderController');
const auth = require('../../middleware/auth');

// ──────────────────────────────────────────────
// Order Routes (all require JWT authentication)
// ──────────────────────────────────────────────

// POST /api/order → Place an order from cart
router.post('/order', auth, orderController.placeOrder);

// GET /api/orders → Get user's order history
router.get('/orders', auth, orderController.getOrders);

module.exports = router;
