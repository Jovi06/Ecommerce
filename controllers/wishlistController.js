const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// GET /wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
        const products = wishlist ? wishlist.products : [];

        res.render('wishlist', {
            title: 'My Wishlist',
            user: req.session.user || null,
            wishlist: products,
            cartCount: req.session.cart ? req.session.cart.length : 0
        });
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// POST /wishlist/toggle
exports.postToggleWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [productId] });
        } else {
            const index = wishlist.products.findIndex(
                id => id.toString() === productId
            );

            if (index > -1) {
                wishlist.products.splice(index, 1);
            } else {
                wishlist.products.push(productId);
            }

            await wishlist.save();
        }

        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// POST /wishlist/move-to-cart
exports.postMoveToCart = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId } = req.body;

        // Add product to session cart (same logic as cartController.addToCart)
        const product = await Product.findById(productId);
        if (!product) return res.redirect('back');

        if (!req.session.cart) {
            req.session.cart = [];
        }

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

        // Remove product from wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                id => id.toString() !== productId
            );
            await wishlist.save();
        }

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};
