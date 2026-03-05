const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['running', 'lifestyle', 'basketball', 'training', 'jordan', 'skateboarding']
    },
    gender: {
        type: String,
        required: true,
        enum: ['men', 'women', 'kids']
    },
    image: {
        type: String,
        default: '/images/placeholder.png'
    },
    images: {
        type: [String],
        default: []
    },
    sizes: {
        type: [String],
        default: []
    },
    colors: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 0
    },
    badge: {
        type: String,
        enum: ['', 'new', 'sale', 'sold-out', 'best-seller'],
        default: ''
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
