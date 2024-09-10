const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// User Registration
exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, major, minor, pronouns } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO Users (FirstName, LastName, Email, Password, Major, Minor, Pronouns)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [firstName, lastName, email, hashedPassword, major, minor, pronouns], (err, result) => {
            if (err) {
                return res.json({ 
                    success: false, 
                    message: 'There was an error registering your account. Please try again.' 
                });
            }

            const userId = result.insertId; // Get the newly inserted user's ID
            const token = jwt.sign(
                { id: userId, email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ 
                success: true, 
                message: 'Registration successful! You are now logged in.',
                token 
            });
        });
    } catch (err) {
        res.json({ 
            success: false, 
            message: 'An error occurred during registration. Please try again.' 
        });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { emailOrId, password } = req.body;

    try {
        const query = `
            SELECT * FROM Users WHERE Email = ? OR ID = ?
        `;

        db.query(query, [emailOrId, emailOrId], async (err, results) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'There was an error finding your account. Please try again.',
                });
            }

            if (results.length === 0) {
                return res.json({
                    success: false,
                    message: 'No account found with that email or ID.',
                });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.Password);

            if (!isMatch) {
                return res.json({
                    success: false,
                    message: 'The password you entered is incorrect. Please try again.',
                });
            }

            if (!process.env.JWT_SECRET) {
                return res.json({
                    success: false,
                    message: 'JWT_SECRET is not set. Please contact the system administrator.',
                });
            }

            const expiresIn = '2h'; // Token expiration time
            const token = jwt.sign(
                {
                    id: user.ID,
                    email: user.Email,
                    jti: `${user.ID}-${Date.now()}`
                },
                process.env.JWT_SECRET,
                { expiresIn }
            );

            // Calculate the expiration date and time
            const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
            const expirationDate = expirationTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

            console.log('Generated Token:', token); // Log the generated token

            res.json({
                success: true,
                message: 'Login successful! Welcome back!',
                token,
                expiresAt: expirationDate
            });
        });
    } catch (err) {
        res.json({
            success: false,
            message: 'An error occurred during login. Please try again.',
        });
    }
};

// User Logout
exports.logoutUser = (req, res) => {
    const token = req.headers['authorization'];

    // The token should have already been verified by the verifyToken middleware
    const decoded = req.decodedToken; // Assume verifyToken middleware sets req.decodedToken

    if (decoded) {
        const tokenID = decoded.jti; // Use the jti (JWT id) from the decoded token
        const expirationTime = new Date(decoded.exp * 1000); // Convert exp to milliseconds

        const query = `
            INSERT INTO TokenBlacklist (TokenID, UserID, ExpirationTime)
            VALUES (?, ?, ?)
        `;

        db.query(query, [tokenID, decoded.id, expirationTime], (err, result) => {
            if (err) {
                console.error('Database Error:', err); // Log the database error for debugging
                return res.json({
                    success: false,
                    message: 'An error occurred while trying to log you out. Please try again later.',
                });
            }

            res.json({
                success: true,
                message: 'You have been logged out successfully!',
            });
        });
    } else {
        // This block will be reached if, for some reason, req.decodedToken is not set
        console.error('Token verification failed. Decoded token is missing.');
        res.json({
            success: false,
            message: 'Your session could not be verified. Please log in again.',
        });
    }
};


// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.json({
            success: false,
            message: 'No token provided. Please log in.',
        });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({
                success: false,
                message: 'Your session has expired or is invalid. Please log in again.',
            });
        }

        const query = `SELECT * FROM TokenBlacklist WHERE TokenID = ?`;
        db.query(query, [decoded.jti], (err, results) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'An error occurred while verifying your session. Please try again later.',
                });
            }

            if (results.length > 0) {
                return res.json({
                    success: false,
                    message: 'Your session has expired or is invalid. Please log in again.',
                });
            }

            req.userId = decoded.id;
            req.decodedToken = decoded; // Set the decoded token here
            next();
        });
    });
};

// Edit user profile
exports.editUserProfile = async (req, res) => {
    const userId = req.userId; // The userId is already set by the verifyToken middleware
    const { firstName, lastName, email, major, minor, pronouns } = req.body;

    try {
        const query = `
            UPDATE Users 
            SET FirstName = ?, LastName = ?, Email = ?, Major = ?, Minor = ?, Pronouns = ? 
            WHERE ID = ?
        `;

        db.query(query, [firstName, lastName, email, major, minor, pronouns, userId], (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'There was an error updating your profile. Please try again.',
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully!',
            });
        });
    } catch (err) {
        res.json({
            success: false,
            message: 'An error occurred while updating your profile. Please try again.',
        });
    }
};


// Middleware to clear TokenBlacklist table and blacklisted array
exports.clearBlacklist = async (req, res, next) => {
    const clearTableQuery = 'DELETE FROM TokenBlacklist';
    db.query(clearTableQuery, (err, result) => {
        if (err) {
            console.error('Error clearing TokenBlacklist table:', err);
            return res.json({ success: false, message: 'Failed to clear token blacklist' });
        }

        console.log('TokenBlacklist table cleared');
        return res.json({ success: true, message: 'TokenBlacklist table cleared successfully' });
    });
};


// Function to get all blacklisted tokens
exports.getAllBlacklistedTokens = (req, res) => {
    const query = `SELECT * FROM TokenBlacklist`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching blacklisted tokens:', err);
            return res.json({
                success: false,
                message: 'An error occurred while fetching blacklisted tokens. Please try again later.',
            });
        }

        res.json({
            success: true,
            blacklistedTokens: results,
        });
    });
};