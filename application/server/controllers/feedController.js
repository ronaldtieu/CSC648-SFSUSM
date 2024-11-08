const db = require('../config/db');
require('dotenv').config();

// Fetch the user's feed
exports.getUserFeed = (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.json({
            success: false,
            message: 'User ID is required.',
        });
    }

    const getUserFeedQuery = `
        SELECT p.ID AS postId, p.Content AS content, p.CreatedAt AS createdAt, 
               u.FirstName AS firstName, u.LastName AS lastName, 'user' AS source
        FROM Posts p
        JOIN Users u ON p.UserID = u.ID
        WHERE p.UserID = ?  -- User's own posts
        
        UNION
        
        SELECT p.ID AS postId, p.Content AS content, p.CreatedAt AS createdAt, 
               u.FirstName AS firstName, u.LastName AS lastName, 'friend' AS source
        FROM Posts p
        JOIN Friends f ON (f.UserID1 = ? AND f.UserID2 = p.UserID) OR (f.UserID2 = ? AND f.UserID1 = p.UserID)
        JOIN Users u ON p.UserID = u.ID
        
        UNION
        
        SELECT p.ID AS postId, p.Content AS content, p.CreatedAt AS createdAt, 
               u.FirstName AS firstName, u.LastName AS lastName, 'group' AS source
        FROM Posts p
        JOIN GroupMembers gm ON gm.UserID = p.UserID
        JOIN \`Groups\` g ON gm.GroupID = g.ID
        JOIN Users u ON p.UserID = u.ID
        WHERE gm.GroupID IN (SELECT GroupID FROM GroupMembers WHERE UserID = ?)

        ORDER BY createdAt DESC
        LIMIT 50;  -- Limit results to the latest 50 for performance
    `;

    db.query(getUserFeedQuery, [userId, userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error retrieving user feed:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve user feed.',
            });
        }

        res.json({
            success: true,
            feed: results,
        });
    });
};