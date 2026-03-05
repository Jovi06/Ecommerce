// Flash message middleware using sessions
module.exports = (req, res, next) => {
    // Set flash message
    res.flash = (type, message) => {
        if (!req.session.flash) req.session.flash = {};
        req.session.flash[type] = message;
    };

    // Make flash messages available to views, then clear them
    res.locals.flash = req.session.flash || {};
    delete req.session.flash;

    next();
};
