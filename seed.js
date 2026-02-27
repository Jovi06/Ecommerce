// ──────────────────────────────────────────────
// Seed Script — Populate the database with sample products
// ──────────────────────────────────────────────
// Run this file once to add sample data:
//   node seed.js
//
// If local MongoDB isn't running, this will use
// the in-memory MongoDB (same as the main app).
// ──────────────────────────────────────────────

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// ──────────────────────────────────────────────
// Sample Products Data
// ──────────────────────────────────────────────

const products = [
    // ═══════════════════════════════════════════
    // MEN'S PRODUCTS (5)
    // ═══════════════════════════════════════════
    {
        name: 'Nike Air Max 90',
        price: 130,
        description: 'Nothing as icons make icons. The Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details.',
        category: 'lifestyle',
        gender: 'men',
        image: '/images/air-max-90.png',
        images: ['/images/air-max-90.png'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['White', 'Black', 'Grey'],
        stock: 25
    },
    {
        name: 'Nike Air Max 97',
        price: 175,
        description: 'Push your style forward with the Air Max 97. Its full-length Nike Air unit delivers a smooth comfortable ride, while the iconic design lines maintain the legacy.',
        category: 'lifestyle',
        gender: 'men',
        image: '/images/air-max-97.png',
        images: ['/images/air-max-97.png'],
        sizes: ['7', '8', '9', '10', '11', '12', '13'],
        colors: ['Silver', 'Black', 'White'],
        stock: 18
    },
    {
        name: 'Nike Air Max Pulse',
        price: 150,
        description: 'Bring the past forward in the Air Max Pulse. Inspired by the icons that came before it, visible Air, bold design and a comfortable ride come together.',
        category: 'running',
        gender: 'men',
        image: '/images/air-max-pulse.png',
        images: ['/images/air-max-pulse.png'],
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['Black', 'White', 'Red'],
        stock: 30
    },
    {
        name: 'Nike Dunk Low Retro',
        price: 115,
        description: 'Created for the hardwood but taken to the streets, the basketball icon returns with perfectly shiny leather, bold team colors and classic 80s construction.',
        category: 'skateboarding',
        gender: 'men',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black/White', 'University Red', 'Grey Fog'],
        stock: 22
    },
    {
        name: 'Air Jordan 1 Mid',
        price: 125,
        description: 'Inspired by the original AJ1, this mid-top edition maintains the iconic look you love while the Air-Sole unit and the padded collar bring you comfort.',
        category: 'jordan',
        gender: 'men',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['7', '8', '9', '10', '11', '12', '13'],
        colors: ['Black/Red', 'White/Black', 'Chicago'],
        stock: 15
    },

    // ═══════════════════════════════════════════
    // WOMEN'S PRODUCTS (5)
    // ═══════════════════════════════════════════
    {
        name: 'Nike Air Max 270',
        price: 160,
        description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the 270. The design draws inspiration from Air Max icons, while a large window shows off Max Air.",
        category: 'lifestyle',
        gender: 'women',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['5', '6', '7', '8', '9', '10'],
        colors: ['Barely Rose', 'White', 'Black'],
        stock: 20
    },
    {
        name: 'Nike Air Force 1 07',
        price: 110,
        description: 'The radiance lives on in the Nike Air Force 1 07, the basketball original that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and AF-1 sole.',
        category: 'lifestyle',
        gender: 'women',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['5', '6', '7', '8', '9', '10'],
        colors: ['White', 'Black', 'Pink'],
        stock: 35
    },
    {
        name: 'Nike ZoomX Invincible Run 3',
        price: 180,
        description: 'With maximum cushioning to support every mile, the Invincible 3 gives you our highest level of comfort underfoot to help you stay on your feet today, tomorrow and beyond.',
        category: 'running',
        gender: 'women',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['5', '6', '7', '8', '9'],
        colors: ['Pink Spell', 'Volt', 'White'],
        stock: 12
    },
    {
        name: 'Nike Metcon 9',
        price: 150,
        description: 'The Metcon 9 is incredibly stable for lifting yet flexible and comfortable for sprints and short runs. A textured rubber Hyperlift plate helps keep you flat and stable.',
        category: 'training',
        gender: 'women',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['5', '6', '7', '8', '9', '10'],
        colors: ['White/Gold', 'Black/Pink', 'Grey'],
        stock: 16
    },
    {
        name: 'Nike V2K Run',
        price: 110,
        description: 'Reach new levels of comfort with the V2K Run. Its ultra-plush ride combines ZoomX foam and an exposed Air unit for total cushioning.',
        category: 'running',
        gender: 'women',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['5', '6', '7', '8', '9'],
        colors: ['Platinum Tint', 'Pink Foam', 'Black'],
        stock: 28
    },

    // ═══════════════════════════════════════════
    // KIDS' PRODUCTS (5)
    // ═══════════════════════════════════════════
    {
        name: 'Nike Air Max 90 LTR',
        price: 90,
        description: "Have them icons from the start. The Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched overlays and plastic accents.",
        category: 'lifestyle',
        gender: 'kids',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['3Y', '4Y', '5Y', '6Y', '7Y'],
        colors: ['White', 'Black', 'Pink Foam'],
        stock: 20
    },
    {
        name: 'Nike Dunk Low',
        price: 85,
        description: 'Created for the hardwood but icons to the streets, these dunks make every playground a fashion runway with bold colors and premium materials.',
        category: 'skateboarding',
        gender: 'kids',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['3Y', '4Y', '5Y', '6Y', '7Y'],
        colors: ['Panda', 'Grey Fog', 'University Blue'],
        stock: 18
    },
    {
        name: 'Nike Star Runner 4',
        price: 55,
        description: 'Ready, set, go! Designed for young runners, the Star Runner 4 has a lightweight feel with plenty of cushioning to keep them running around.',
        category: 'running',
        gender: 'kids',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['1Y', '2Y', '3Y', '4Y', '5Y', '6Y'],
        colors: ['Black/White', 'Blue/Volt', 'Pink'],
        stock: 40
    },
    {
        name: 'Air Jordan 1 Mid SE',
        price: 100,
        description: 'A colour-blocked mix of leather and synthetic materials with a foam midsole gives every step comfort and iconic Jordan style.',
        category: 'jordan',
        gender: 'kids',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['3Y', '4Y', '5Y', '6Y', '7Y'],
        colors: ['Black/Red', 'White/Blue', 'Pink/White'],
        stock: 14
    },
    {
        name: 'Nike Air Force 1 LE',
        price: 75,
        description: 'Classic style meets everyday comfort. The Air Force 1 LE brings big-kid energy with the same iconic design loved by adults worldwide.',
        category: 'lifestyle',
        gender: 'kids',
        image: '/images/placeholder.png',
        images: ['/images/placeholder.png'],
        sizes: ['3Y', '4Y', '5Y', '6Y', '7Y'],
        colors: ['White', 'Black', 'Pink Glaze'],
        stock: 32
    }
];

// ──────────────────────────────────────────────
// Seed Function
// ──────────────────────────────────────────────

const connectForSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.warn('⚠️  Local MongoDB not available. Starting in-memory MongoDB...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
        console.log('✅ Connected to in-memory MongoDB');
    }
};

const seedDB = async () => {
    try {
        await connectForSeed();

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert sample products
        const created = await Product.insertMany(products);
        console.log(`🎉 Inserted ${created.length} sample products!`);
        console.log('');
        console.log('Breakdown:');
        console.log(`   Men's:   ${created.filter(p => p.gender === 'men').length} products`);
        console.log(`   Women's: ${created.filter(p => p.gender === 'women').length} products`);
        console.log(`   Kids':   ${created.filter(p => p.gender === 'kids').length} products`);

        await mongoose.disconnect();
        console.log('');
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

// Export the products array so app.js can use it for auto-seeding
module.exports = { products };

// Only run seedDB if this file is run directly (not imported)
if (require.main === module) {
    seedDB();
}
