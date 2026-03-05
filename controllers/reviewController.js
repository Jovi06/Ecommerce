const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * Recalculate and save a product's averageRating and numReviews
 * using an aggregation pipeline on the Review collection.
 */
async function recalculateProductStats(product) {
    const stats = await Review.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (stats.length > 0) {
        product.averageRating = Math.round(stats[0].avgRating * 10) / 10;
        product.numReviews = stats[0].count;
    } else {
        product.averageRating = 0;
        product.numReviews = 0;
    }
    await product.save();
}

// POST /review/add
exports.postAddReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;
        const userId = req.session.user.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.redirect('back');
        }

        // Clamp rating between 1 and 5
        const safeRating = Math.min(5, Math.max(1, parseInt(rating)));

        // Check if the user has already reviewed this product
        let review = await Review.findOne({ user: userId, product: productId });

        if (review) {
            // Update existing review
            review.rating = safeRating;
            review.title = title;
            review.comment = comment;
            await review.save();
        } else {
            // Create new review
            review = await Review.create({
                user: userId,
                product: productId,
                rating: safeRating,
                title,
                comment
            });
        }

        // Recalculate product stats using aggregation
        await recalculateProductStats(product);

        res.redirect('/product/' + productId);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};

// POST /review/delete
exports.postDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.session.user.id;
        const isAdmin = req.session.user.role === 'admin';

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.redirect('back');
        }

        // Verify the review belongs to the current user or user is admin
        if (review.user.toString() !== userId && !isAdmin) {
            return res.redirect('back');
        }

        const product = await Product.findById(review.product);

        await Review.findByIdAndDelete(reviewId);

        // Recalculate product stats if product still exists
        if (product) {
            await recalculateProductStats(product);
        }

        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};
