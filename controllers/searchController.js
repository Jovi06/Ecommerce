const Product = require('../models/Product');

// GET /search
exports.getSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        const gender = req.query.gender || '';
        const category = req.query.category || '';
        const sort = req.query.sort || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        // If no search query, render with empty results
        if (!query) {
            return res.render('search', {
                title: 'Search | Nike',
                user: req.session.user || null,
                products: [],
                query: '',
                totalResults: 0,
                currentPage: 1,
                totalPages: 0,
                currentGender: gender,
                currentCategory: category,
                currentSort: sort,
                cartCount: req.session.cart ? req.session.cart.length : 0
            });
        }

        // Build filter with regex search on name and description
        let filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        // Apply optional gender filter
        if (gender) {
            filter.gender = gender;
        }

        // Apply optional category filter
        if (category) {
            filter.category = category;
        }

        // Build sort option
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else sortOption.createdAt = -1;

        // Execute query with pagination and get total count in parallel
        const [products, totalResults] = await Promise.all([
            Product.find(filter).sort(sortOption).skip(skip).limit(limit),
            Product.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.render('search', {
            title: `Search results for "${query}" | Nike`,
            user: req.session.user || null,
            products,
            query,
            totalResults,
            currentPage: page,
            totalPages,
            currentGender: gender,
            currentCategory: category,
            currentSort: sort,
            cartCount: req.session.cart ? req.session.cart.length : 0
        });
    } catch (err) {
        console.error(err);
        res.render('search', {
            title: 'Search | Nike',
            user: req.session.user || null,
            products: [],
            query: req.query.q || '',
            totalResults: 0,
            currentPage: 1,
            totalPages: 0,
            currentGender: '',
            currentCategory: '',
            currentSort: '',
            cartCount: req.session.cart ? req.session.cart.length : 0
        });
    }
};
