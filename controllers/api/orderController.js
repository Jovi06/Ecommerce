const Order = require('../../models/Order');
const Cart = require('../../models/Cart');

// ──────────────────────────────────────────────
// POST /api/order
// ──────────────────────────────────────────────
// Place an order using the items currently in the
// user's cart. The cart is cleared after the order.
//
// Request body (optional shipping address):
//   {
//     "shippingAddress": {
//       "fullName": "John Doe",
//       "address": "123 Main St",
//       "city": "New York",
//       "state": "NY",
//       "zip": "10001",
//       "phone": "555-1234"
//     }
//   }
//
// Response:
//   { "success": true, "order": { ... } }
// ──────────────────────────────────────────────
exports.placeOrder = async (req, res) => {
    try {
        // Get user's cart with product details
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price image');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Add items before placing an order.'
            });
        }

        // Calculate total and build order items
        let total = 0;
        const orderItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return {
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                size: item.size || '',
                color: item.color || '',
                image: item.product.image
            };
        });

        total = Math.round(total * 100) / 100;  // Round to 2 decimals

        // Create the order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            total,
            shippingAddress: req.body.shippingAddress || {}
        });

        // Clear the cart after placing the order
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order
        });
    } catch (err) {
        console.error('Place order error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// GET /api/orders
// ──────────────────────────────────────────────
// Get all orders for the logged-in user.
//
// Response:
//   { "success": true, "count": 3, "orders": [...] }
// ──────────────────────────────────────────────
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 });  // Newest first

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};
