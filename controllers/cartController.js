const Product = require('../models/Product');

// POST /cart/add
exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.redirect(req.get('Referer') || '/');

        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if item already in cart
        const existingIndex = req.session.cart.findIndex(
            item => item.productId === productId
        );

        if (existingIndex > -1) {
            req.session.cart[existingIndex].quantity += 1;
        } else {
            req.session.cart.push({
                productId: product._id.toString(),
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        res.redirect(req.get('Referer') || '/');
    } catch (err) {
        console.error(err);
        res.redirect(req.get('Referer') || '/');
    }
};

// POST /cart/remove
exports.removeFromCart = (req, res) => {
    const { productId } = req.body;
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(
            item => item.productId !== productId
        );
    }
    res.redirect('/cart');
};

// POST /cart/update
exports.updateCart = (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (req.session.cart) {
        if (qty <= 0) {
            req.session.cart = req.session.cart.filter(
                item => item.productId !== productId
            );
        } else {
            const item = req.session.cart.find(
                item => item.productId === productId
            );
            if (item) item.quantity = qty;
        }
    }

    res.redirect('/cart');
};

// GET /cart
exports.getCart = (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render('cart', {
        title: 'Your Cart',
        user: req.session.user || null,
        cart,
        total,
        cartCount: cart.length
    });
};
