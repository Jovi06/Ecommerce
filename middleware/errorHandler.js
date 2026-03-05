// Centralized error handling middleware
module.exports = (err, req, res, next) => {
    console.error('Error:', err.message || err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong.';

    // API routes return JSON
    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({
            success: false,
            message
        });
    }

    // EJS routes render error page
    res.status(statusCode).render('404', {
        title: 'Error',
        user: req.session ? req.session.user : null,
        cartCount: req.session && req.session.cart ? req.session.cart.length : 0
    });
};
