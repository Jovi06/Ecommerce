const Cart = require('../../models/Cart');
const Product = require('../../models/Product');

// ──────────────────────────────────────────────
// GET /api/cart
// ──────────────────────────────────────────────
// Get the logged-in user's cart with full product details.
//
// Response:
//   { "success": true, "cart": { items: [...], total: 500 } }
// ──────────────────────────────────────────────
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price image images');

        if (!cart || cart.items.length === 0) {
            return res.json({
                success: true,
                cart: { items: [], total: 0 }
            });
        }

        // Calculate total price
        let total = 0;
        cart.items.forEach(item => {
            if (item.product) {
                total += item.product.price * item.quantity;
            }
        });

        res.json({
            success: true,
            cart: {
                items: cart.items,
                total: Math.round(total * 100) / 100  // Round to 2 decimal places
            }
        });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// POST /api/cart
// ──────────────────────────────────────────────
// Add an item to the cart.
//
// Request body:
//   { "productId": "...", "quantity": 1, "size": "10", "color": "Black" }
//
// If the product already exists in the cart, the quantity is increased.
// ──────────────────────────────────────────────
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size = '', color = '' } = req.body;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        // Find or create cart for this user
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            // Create a new cart
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if product already in cart
        const existingIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingIndex > -1) {
            // Update quantity
            cart.items[existingIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                size,
                color
            });
        }

        await cart.save();

        // Return updated cart with populated product details
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image images');

        res.status(201).json({
            success: true,
            message: 'Item added to cart.',
            cart: updatedCart
        });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// PUT /api/cart
// ──────────────────────────────────────────────
// Update the quantity of an item in the cart.
//
// Request body:
//   { "productId": "...", "quantity": 3 }
//
// If quantity is 0 or less, the item is removed.
// ──────────────────────────────────────────────
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }

        if (quantity <= 0) {
            // Remove the item
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        } else {
            // Update quantity
            const item = cart.items.find(
                item => item.product.toString() === productId
            );
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart.'
                });
            }
            item.quantity = quantity;
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image images');

        res.json({
            success: true,
            message: 'Cart updated.',
            cart: updatedCart
        });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// DELETE /api/cart/:productId
// ──────────────────────────────────────────────
// Remove a specific item from the cart.
// ──────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }

        // Filter out the item
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price image images');

        res.json({
            success: true,
            message: 'Item removed from cart.',
            cart: updatedCart
        });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};
