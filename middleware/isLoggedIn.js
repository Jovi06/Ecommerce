// Middleware: Redirect to login if user is not logged in
module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};
