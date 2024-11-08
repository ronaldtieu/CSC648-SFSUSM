const jwt = require('jsonwebtoken');

// Check if user is authenticated with JWT
exports.checkAuth = (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.json({ success: false, message: 'Token not found. Please log in.' });
    }

    console.log("This is the token =  " + token);
    console.log("This is the JWT_SECRET = " + process.env.JWT_SECRET );

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ success: false, message: 'The token is invalid or has expired. Please log in again.' });
        }

        const query = `SELECT * FROM Users WHERE ID = ?`;
        db.query(query, [decoded.id], (err, results) => {
            if (err) {
                return res.json({ success: false, message: 'An error occurred while checking your session. Please try again later.' });
            }
            if (results.length === 0) {
                return res.json({ success: false, message: 'User not found. Please log in.' });
            }

            const user = results[0];
            res.json({
                success: true,
                loggedIn: true,
                user: {
                    firstName: user.FirstName,
                    lastName: user.LastName,
                    email: user.Email,
                    major: user.Major,
                    minor: user.Minor,
                    pronouns: user.Pronouns,
                }
            });
        });
    });
};