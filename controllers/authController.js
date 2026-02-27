const User = require('../models/User');

// GET /signup
exports.getSignup = (req, res) => {
    res.render('signup', {
        title: 'Sign Up',
        user: req.session.user || null,
        error: null
    });
};

// POST /signup
exports.postSignup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: 'All fields are required.'
            });
        }

        if (password !== confirmPassword) {
            return res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: 'Passwords do not match.'
            });
        }

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: 'Email is already registered.'
            });
        }

        // Create user
        const newUser = await User.create({ name, email, password });

        // Set session
        req.session.user = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Something went wrong. Please try again.'
        });
    }
};

// GET /login
exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'Log In',
        user: req.session.user || null,
        error: null
    });
};

// POST /login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', {
                title: 'Log In',
                user: null,
                error: 'Email and password are required.'
            });
        }

        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.render('login', {
                title: 'Log In',
                user: null,
                error: 'Invalid email or password.'
            });
        }

        const isMatch = await foundUser.comparePassword(password);
        if (!isMatch) {
            return res.render('login', {
                title: 'Log In',
                user: null,
                error: 'Invalid email or password.'
            });
        }

        // Set session
        req.session.user = {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('login', {
            title: 'Log In',
            user: null,
            error: 'Something went wrong. Please try again.'
        });
    }
};

// GET /logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
