const Product = require('../models/Product');

// GET / (Home page)
exports.getHome = async (req, res) => {
    try {
        const products = await Product.find().limit(5).sort({ createdAt: -1 });
        res.render('home', {
            title: 'Nike | Hungry For More',
            user: req.session.user || null,
            products,
            cartCount: req.session.cart ? req.session.cart.length : 0
        });
    } catch (err) {
        console.error(err);
        res.render('home', {
            title: 'Nike | Hungry For More',
            user: req.session.user || null,
            products: [],
            cartCount: 0
        });
    }
};

// GET /men
exports.getMen = async (req, res) => {
    try {
        const { category, sort } = req.query;
        let filter = { gender: 'men' };
        if (category) filter.category = category;

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        const products = await Product.find(filter).sort(sortOption);
        res.render('men', {
            title: "Men's Shoes",
            user: req.session.user || null,
            products,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            currentCategory: category || '',
            currentSort: sort || ''
        });
    } catch (err) {
        console.error(err);
        res.render('men', {
            title: "Men's Shoes",
            user: req.session.user || null,
            products: [],
            cartCount: 0,
            currentCategory: '',
            currentSort: ''
        });
    }
};

// GET /women
exports.getWomen = async (req, res) => {
    try {
        const { category, sort } = req.query;
        let filter = { gender: 'women' };
        if (category) filter.category = category;

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        const products = await Product.find(filter).sort(sortOption);
        res.render('women', {
            title: "Women's Shoes",
            user: req.session.user || null,
            products,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            currentCategory: category || '',
            currentSort: sort || ''
        });
    } catch (err) {
        console.error(err);
        res.render('women', {
            title: "Women's Shoes",
            user: req.session.user || null,
            products: [],
            cartCount: 0,
            currentCategory: '',
            currentSort: ''
        });
    }
};

// GET /kids
exports.getKids = async (req, res) => {
    try {
        const { category, sort } = req.query;
        let filter = { gender: 'kids' };
        if (category) filter.category = category;

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        const products = await Product.find(filter).sort(sortOption);
        res.render('kids', {
            title: "Kids' Shoes",
            user: req.session.user || null,
            products,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            currentCategory: category || '',
            currentSort: sort || ''
        });
    } catch (err) {
        console.error(err);
        res.render('kids', {
            title: "Kids' Shoes",
            user: req.session.user || null,
            products: [],
            cartCount: 0,
            currentCategory: '',
            currentSort: ''
        });
    }
};

// GET /product/:id
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.redirect('/');

        const related = await Product.find({
            gender: product.gender,
            _id: { $ne: product._id }
        }).limit(4);

        res.render('product', {
            title: product.name,
            user: req.session.user || null,
            product,
            related,
            cartCount: req.session.cart ? req.session.cart.length : 0
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};
