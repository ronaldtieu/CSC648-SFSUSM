const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Register
exports.registerUser = async (req, res, next) => {
    const { firstName, lastName, email, password, major, minor, pronouns } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO Users (FirstName, LastName, Email, Password, Major, Minor, Pronouns)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [firstName, lastName, email, hashedPassword, major, minor, pronouns], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Error registering user' });
            }
            req.userId = result.insertId;
            next(); // Pass control to the login function
        });
    } catch (err) {
        res.json({ success: false, message: 'Error processing registration' });
    }
};

// Login After Registration
exports.loginAfterRegistration = (req, res, next) => {
    const userId = req.userId;

    const query = `
        SELECT * FROM Users WHERE ID = ?
    `;

    db.query(query, [userId], async (err, results) => {
        if (err) {
            return res.json({ success: false, message: 'Error finding user' });
        }

        const user = results[0];

        try {
            const accessToken = jwt.sign({ id: user.ID, email: user.Email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Store the user information in the session
            req.session.userId = user.ID;

            res.json({ success: true, message: 'Login successful', accessToken });
        } catch (err) {
            res.json({ success: false, message: 'Error generating token' });
        }
    });
};

// User Login
exports.loginUser = async (req, res, next) => {
    const { emailOrId, password } = req.body;

    try {
        const query = `
            SELECT * FROM Users WHERE Email = ? OR ID = ?
        `;

        db.query(query, [emailOrId, emailOrId], async (err, results) => {
            if (err) {
                return res.json({ success: false, message: 'Error finding user' });
            }

            if (results.length === 0) {
                return res.json({ success: false, message: 'User not found' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.Password);

            if (!isMatch) {
                return res.json({ success: false, message: 'Invalid password' });
            }

            const accessToken = jwt.sign({ id: user.ID, email: user.Email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Store the user information in the session
            req.session.userId = user.ID;

            res.json({ success: true, message: 'Login successful', accessToken });
        });
    } catch (err) {
        res.json({ success: false, message: 'Error processing login' });
    }
};


// Logout user and destroy session
exports.logoutUser = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.json({ success: false, message: 'Error logging out. Please try again.' });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.json({ success: true, message: 'Logout successful' });
    });
};