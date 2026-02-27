const jwt = require('jsonwebtoken');

// ──────────────────────────────────────────────
// JWT Authentication Middleware
// ──────────────────────────────────────────────
// Usage: Add this middleware to any route that
// requires a logged-in user.
//
// The frontend must send the token like this:
//   headers: { "Authorization": "Bearer <token>" }
//
// After verification, req.user will contain:
//   { id, email, role }
// ──────────────────────────────────────────────

module.exports = (req, res, next) => {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    // 3. Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attach user info to the request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        // 6. Continue to the next middleware/route handler
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};
