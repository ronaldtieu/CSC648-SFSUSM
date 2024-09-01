const session = require('express-session');
const db = require('../config/db');

// Session configuration
exports.sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, // Load the secret from environment variables
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // secure: true in production
});

// Function to check the session and return user info
exports.checkSession = (req, res) => {
    if (req.session.userId) {
        console.log('Session ID:', req.session.id);  // Log the session ID
        console.log('User ID in session:', req.session.userId);  // Log the user ID stored in session

        const query = `SELECT * FROM Users WHERE ID = ?`;

        db.query(query, [req.session.userId], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err.stack);
                return res.status(500).json({ success: false, message: 'Error fetching user data' });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const user = results[0];
            res.json({
                loggedIn: true,
                user: {
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    email: user.Email,
                    studentId: req.session.userId,  // Add studentId as userId
                    major: user.Major,
                    minor: user.Minor,
                    pronouns: user.Pronouns,
                }
            });
        });
    } else {
        console.log('No session or user is not logged in');  // Log if no session exists
        res.json({ loggedIn: false });
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.json({ success: false, message: 'Error logging out. Please try again.' });
      }
      res.clearCookie('connect.sid'); // Clears the session cookie
      res.json({ success: true, message: 'Logout successful' });
    });
  };