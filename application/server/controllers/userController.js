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
                    message: 'Email already exists.' 
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
        // Check if there's already a valid session (token) in the cookies
        const existingToken = req.cookies.token;
        if (existingToken) {
            try {
                const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
                // If the token is valid, prevent a new login
                return res.json({
                    success: false,
                    message: 'You are already logged in. Please log out before logging in with another account.',
                    token: existingToken, 
                    user: decoded 
                });
            } catch (err) {
                // If the token is invalid (expired or tampered), allow login to proceed
                console.log('Existing token is invalid, proceeding with login.');
            }
        }

        // Proceed with login logic if no existing valid session
        const query = `SELECT * FROM Users WHERE Email = ? OR ID = ?`;

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

            // Debug logs to help track the password comparison
            console.log('Hashed password in DB:', user.Password);  // Log the hashed password from the DB
            console.log('User-provided password:', password);  // Log the plain text password provided by the user
          

            if (!isMatch) {
                return res.json({
                    success: false,
                    message: 'The password you entered is incorrect. Please try again.',
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

            // Set the token as an HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Set to true in production
                maxAge: 2 * 60 * 60 * 1000 // 2 hours
            });

            return res.json({
                success: true,
                message: 'Login successful! Welcome back!',
                token, 
            });
        });
    } catch (err) {
        return res.json({
            success: false,
            message: 'An error occurred during login. Please try again.',
        });
    }
};

// User Logout
exports.logoutUser = (req, res) => {
    const token = req.cookies.token; // Get the token from the cookies

    if (!token) {
        return res.json({
            success: false,
            message: 'No active session found. Please log in first.',
        });
    }

    // Invalidate the token by clearing the cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    return res.json({
        success: true,
        message: 'You have been logged out successfully!',
    });
};


// Verify Token Middleware from Cookies
exports.verifyToken = (req, res, next) => {
    // Extract the token from the cookies 
    let token = req.cookies.token;

    if (!token) {
        req.sessionStatus = {
            success: false,
            message: 'No token provided. Please log in.',
        };
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            req.sessionStatus = {
                success: false,
                message: 'Your session has expired or is invalid. Please log in again.',
            };
            return next();
        }

        const query = `SELECT * FROM TokenBlacklist WHERE TokenID = ?`;
        db.query(query, [decoded.jti], (err, results) => {
            if (err) {
                req.sessionStatus = {
                    success: false,
                    message: 'An error occurred while verifying your session. Please try again later.',
                };
                return next();
            }

            if (results.length > 0) {
                req.sessionStatus = {
                    success: false,
                    message: 'Your session has expired or is invalid. Please log in again.',
                };
                return next();
            }

            req.userId = decoded.id; // Attach userId to the request object
            req.decodedToken = decoded; // Attach decoded token to the request object
            req.sessionStatus = {
                success: true,
                message: 'Session is active.',
                user: decoded,
            };
            next();
        });
    });
};


//Get user information
exports.getUserInfo = (req, res) => {
    const token = req.cookies.token;  
  
    if (!token) {
      return res.json({
        success: false,
        message: 'Error with token. No token provided. Please log in.',
      });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Invalid or expired token. Please log in again.',
        });
      }
  
      const userId = decoded.id;  // Extract user ID from the decoded token
  
      // SQL query to fetch the user information from the database
      const query = `
        SELECT 
          FirstName,
          LastName,
          Email,
          ID AS StudentID,
          Major,
          Minor,
          Pronouns
        FROM Users 
        WHERE ID = ?
      `;
  
      db.query(query, [userId], (err, results) => {
        if (err) {
          return res.json({
            success: false,
            message: 'DB query error. Failed to retrieve user information.',
          });
        }
  
        if (results.length === 0) {
          return res.json({
            success: false,
            message: 'No user found with the provided ID.',
          });
        }
  
        // Send back the user information
        res.json({
          success: true,
          user: results[0],  // Return the user info
        });
      });
    });
  };

// Edit user profile
exports.editUserProfile = async (req, res, next) => {
    const userId = req.userId; // The userId should be set by the verifyToken middleware
    const { firstName, lastName, email, major, minor, pronouns } = req.body;

    try {
        // Build the SQL query dynamically based on provided fields
        let query = `UPDATE Users SET FirstName = ?, LastName = ?, Major = ?, Minor = ?, Pronouns = ?`;
        const queryParams = [firstName, lastName, major, minor, pronouns];

        if (email) {
            query += `, Email = ?`;
            queryParams.push(email);
        }

        query += ` WHERE ID = ?`;
        queryParams.push(userId);

        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.error('SQL Error:', err);
                // Pass the error to the next middleware
                return next(new Error('There was an error updating your profile. Please try again.'));
            }

            res.json({
                success: true,
                message: 'Profile updated successfully!',
            });
        });
    } catch (err) {
        console.error('Catch Error:', err);
        // Pass the error to the next middleware
        next(new Error('An error occurred while updating your profile. Please try again.'));
    }
};


// Clear TokenBlacklist table and blacklisted array
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

// Middleware to show the current cookies
exports.showCookies = (req, res, next) => {
    const cookies = req.cookies;
    
    if (!cookies || Object.keys(cookies).length === 0) {
        return res.json({
            success: false,
            message: 'No cookies found.'
        });
    }

    return res.json({
        success: true,
        message: 'Cookies retrieved successfully.',
        cookies: cookies
    });
};

// Middleware to clear all cookies
exports.clearCookies = (req, res, next) => {
    const cookies = req.cookies;

    if (!cookies || Object.keys(cookies).length === 0) {
        return res.json({
            success: false,
            message: 'No cookies to clear.'
        });
    }

    // Clear each cookie
    for (let cookieName in cookies) {
        res.clearCookie(cookieName);
    }

    return res.json({
        success: true,
        message: 'All cookies have been cleared.'
    });
};

// Get Majors
exports.getMajor = (req, res) => {
    const query = `SELECT * FROM Majors`;

    db.query(query, (err, results) => {
        if(err) {
            console.error('SQL Error:', err);
            return res.json({
                success: false,
                message: 'There was an error retrieving the list of majors',
            });
        }
        res.json({
            success: true,
            message: results, // return the inserts of majors
        });
    });
};

// Get Minors
exports.getMinor = (req, res) => {
    const query = `SELECT * FROM Minors`;
    
    db.query(query, (err, results) => {
        if(err) {
            console.error('SQL Error: ', err);
            return res.json({
                success: false,
                message: 'There was an error retrieving the list of minors'
            });
        }
        res.json({
            success: true,
            message: results,
        });
    });
};

exports.getAllUsers = (req, res) => {
    const query = `
        SELECT ID, FirstName, LastName, Email 
        FROM Users
        ORDER BY FirstName ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving users:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve users. Please try again later.',
            });
        }

        res.json({
            success: true,
            users: results,  // Array of user objects
        });
    });
};