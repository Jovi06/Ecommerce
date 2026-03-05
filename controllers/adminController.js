const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.upload = upload.single('image');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;

        const [totalProducts, totalUsers, totalOrders, revenueResult, recentOrders] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email')
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user,
            cartCount,
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue,
            recentOrders
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /admin/add-product
exports.getAddProduct = (req, res) => {
    res.render('admin/add-product', {
        title: 'Add Product',
        user: req.session.user || null,
        cartCount: req.session.cart ? req.session.cart.length : 0,
        error: null,
        success: null
    });
};

// POST /admin/add-product
exports.postAddProduct = async (req, res) => {
    try {
        const { name, price, description, category, gender } = req.body;

        if (!name || !price || !category || !gender) {
            return res.render('admin/add-product', {
                title: 'Add Product',
                user: req.session.user || null,
                cartCount: req.session.cart ? req.session.cart.length : 0,
                error: 'Name, price, category, and gender are required.',
                success: null
            });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : '/images/placeholder.png';

        await Product.create({
            name,
            price: parseFloat(price),
            description: description || '',
            category,
            gender,
            image: imagePath
        });

        res.render('admin/add-product', {
            title: 'Add Product',
            user: req.session.user || null,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            error: null,
            success: 'Product added successfully!'
        });
    } catch (err) {
        console.error(err);
        res.render('admin/add-product', {
            title: 'Add Product',
            user: req.session.user || null,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            error: 'Failed to add product. Please try again.',
            success: null
        });
    }
};

// GET /admin/products
exports.getManageProducts = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const products = await Product.find().sort({ createdAt: -1 });

        res.render('admin/products', {
            title: 'Manage Products',
            user,
            products,
            cartCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /admin/products/delete
exports.postDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        await Product.findByIdAndDelete(productId);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

// GET /admin/products/edit/:id
exports.getEditProduct = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.redirect('/admin/products');
        }

        res.render('admin/edit-product', {
            title: 'Edit Product',
            user,
            product,
            cartCount,
            error: null,
            success: null
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

// POST /admin/products/edit/:id
exports.postEditProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, description, category, gender, stock, badge, isFeatured } = req.body;

        const updateData = {
            name,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
            description,
            category,
            gender,
            stock: stock ? parseInt(stock) : undefined,
            badge: badge || undefined,
            isFeatured: isFeatured === 'true' || isFeatured === 'on'
        };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/products');
    }
};

// GET /admin/orders
exports.getManageOrders = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');

        res.render('admin/orders', {
            title: 'Manage Orders',
            user,
            orders,
            cartCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /admin/orders/update-status
exports.postUpdateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body;

        const updateData = { status, trackingNumber };

        if (status === 'delivered') {
            updateData.deliveredAt = new Date();
        }

        await Order.findByIdAndUpdate(orderId, updateData);
        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/orders');
    }
};

// GET /admin/users
exports.getManageUsers = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const users = await User.find().sort({ createdAt: -1 });

        res.render('admin/users', {
            title: 'Manage Users',
            user,
            users,
            cartCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /admin/users/update-role
exports.postUpdateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        await User.findByIdAndUpdate(userId, { role });
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/users');
    }
};

// GET /admin/coupons
exports.getManageCoupons = async (req, res) => {
    try {
        const user = req.session.user || null;
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const coupons = await Coupon.find();

        res.render('admin/coupons', {
            title: 'Manage Coupons',
            user,
            coupons,
            cartCount,
            error: null,
            success: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /admin/coupons
exports.postAddCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

        await Coupon.create({
            code,
            discountType,
            discountValue: parseFloat(discountValue),
            minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            maxUses: maxUses ? parseInt(maxUses) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });

        res.redirect('/admin/coupons');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/coupons');
    }
};

// POST /admin/coupons/delete
exports.postDeleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        await Coupon.findByIdAndDelete(couponId);
        res.redirect('/admin/coupons');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/coupons');
    }
};
