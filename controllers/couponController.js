const Coupon = require('../models/Coupon');

// POST /cart/apply-coupon
exports.postApplyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || !code.trim()) {
            req.session.couponError = 'Please enter a coupon code.';
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        // 1. Coupon must exist
        if (!coupon) {
            req.session.couponError = 'Invalid coupon code.';
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        // 2. Coupon must be active
        if (!coupon.isActive) {
            req.session.couponError = 'This coupon is no longer active.';
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        // 3. Coupon must not be expired
        if (coupon.expiresAt <= Date.now()) {
            req.session.couponError = 'This coupon has expired.';
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        // 4. Coupon must not have exceeded max uses (0 = unlimited)
        if (coupon.maxUses !== 0 && coupon.usedCount >= coupon.maxUses) {
            req.session.couponError = 'This coupon has reached its usage limit.';
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        // Calculate cart total
        const cart = req.session.cart || [];
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 5. Cart total must meet minimum order amount
        if (total < coupon.minOrderAmount) {
            req.session.couponError = `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this coupon.`;
            delete req.session.coupon;
            return res.redirect('/cart');
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = total * (coupon.discountValue / 100);
        } else if (coupon.discountType === 'fixed') {
            discount = coupon.discountValue;
        }

        // Cap discount at total amount
        if (discount > total) {
            discount = total;
        }

        // Store coupon in session
        req.session.coupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount
        };

        return res.redirect('/cart');
    } catch (err) {
        console.error(err);
        req.session.couponError = 'Something went wrong. Please try again.';
        delete req.session.coupon;
        return res.redirect('/cart');
    }
};

// POST /cart/remove-coupon
exports.postRemoveCoupon = (req, res) => {
    delete req.session.coupon;
    res.redirect('/cart');
};
