const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isLoggedIn = require('../middleware/isLoggedIn');

router.get('/checkout', isLoggedIn, orderController.getCheckout);
router.post('/order', isLoggedIn, orderController.placeOrder);

module.exports = router;
