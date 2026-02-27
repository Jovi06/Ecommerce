const Product = require('../models/Product');
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
