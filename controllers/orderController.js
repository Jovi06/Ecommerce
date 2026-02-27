const Order = require('../models/Order');

// GET /checkout
exports.getCheckout = (req, res) => {
    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.redirect('/cart');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.render('checkout', {
        title: 'Checkout',
        user: req.session.user || null,
        cart,
        total,
        cartCount: cart.length
    });
};

// POST /order
exports.placeOrder = async (req, res) => {
    try {
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = await Order.create({
            user: req.session.user.id,
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            total
        });

        // Clear cart
        req.session.cart = [];

        res.render('order-success', {
            title: 'Order Confirmed',
            user: req.session.user || null,
            order,
            cartCount: 0
        });
    } catch (err) {
        console.error(err);
        res.redirect('/cart');
    }
};
