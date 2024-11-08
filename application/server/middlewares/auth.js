// May not be needed anymore


const jwt = require('jsonwebtoken');

// Middleware to protect routes by verifying JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized if no token is present
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Attach user information to the request object
        next(); // Continue to the next middleware or route handler
    });
};

module.exports = { authenticateToken };