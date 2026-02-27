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
    // Original single image field (kept for EJS views backward compatibility)
    image: {
        type: String,
        default: '/images/placeholder.png'
    },
    // New fields requested by user
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
