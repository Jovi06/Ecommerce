const express = require('express');
const router = express.Router();
const authController = require('../../controllers/api/authController');
const auth = require('../../middleware/auth');

// ──────────────────────────────────────────────
// Auth Routes (no authentication required for signup/login)
// ──────────────────────────────────────────────

// POST /api/signup → Register a new user
router.post('/signup', authController.signupValidation, authController.signup);

// POST /api/login → Login and get JWT token
router.post('/login', authController.loginValidation, authController.login);

// GET /api/profile → Get logged-in user's profile (requires JWT)
router.get('/profile', auth, authController.getProfile);

module.exports = router;
