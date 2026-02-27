const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');

// ──────────────────────────────────────────────
// Helper: Generate JWT token
// ──────────────────────────────────────────────
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // Token expires in 7 days
    );
};

// ──────────────────────────────────────────────
// Validation rules (used in routes)
// ──────────────────────────────────────────────
exports.signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required.'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email.'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

exports.loginValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email.'),
    body('password')
        .notEmpty().withMessage('Password is required.')
];

// ──────────────────────────────────────────────
// POST /api/signup
// ──────────────────────────────────────────────
// Register a new user and return a JWT token.
//
// Request body:
//   { "name": "John", "email": "john@example.com", "password": "mypassword" }
//
// Response:
//   { "success": true, "token": "...", "user": { ... } }
// ──────────────────────────────────────────────
exports.signup = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // Create new user (password is hashed automatically by the User model)
        const user = await User.create({ name, email, password });

        // Generate JWT token
        const token = generateToken(user);

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// POST /api/login
// ──────────────────────────────────────────────
// Login with email and password, receive a JWT.
//
// Request body:
//   { "email": "john@example.com", "password": "mypassword" }
//
// Response:
//   { "success": true, "token": "...", "user": { ... } }
// ──────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Send response
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// ──────────────────────────────────────────────
// GET /api/profile
// ──────────────────────────────────────────────
// Get the logged-in user's profile.
// Requires JWT token in Authorization header.
// ──────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};
