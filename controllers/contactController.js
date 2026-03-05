const Contact = require('../models/Contact');

// GET /contact
exports.getContact = (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        user: req.session.user || null,
        cartCount: req.session.cart ? req.session.cart.length : 0,
        error: null,
        success: null
    });
};

// POST /contact
exports.postContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate all fields are present
        if (!name || !email || !subject || !message) {
            return res.render('contact', {
                title: 'Contact Us',
                user: req.session.user || null,
                cartCount: req.session.cart ? req.session.cart.length : 0,
                error: 'All fields are required.',
                success: null
            });
        }

        // Create a Contact document
        await Contact.create({ name, email, subject, message });

        res.render('contact', {
            title: 'Contact Us',
            user: req.session.user || null,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            error: null,
            success: 'Your message has been sent! We\'ll get back to you soon.'
        });
    } catch (err) {
        console.error(err);
        res.render('contact', {
            title: 'Contact Us',
            user: req.session.user || null,
            cartCount: req.session.cart ? req.session.cart.length : 0,
            error: 'Something went wrong. Please try again later.',
            success: null
        });
    }
};
