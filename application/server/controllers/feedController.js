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
        SELECT DISTINCT 
            p.ID AS postId, 
            p.Content AS content, 
            p.CreatedAt AS createdAt, 
            p.UserID AS userId, 
            p.Visibility AS visibility,
            p.GroupID AS groupId,
            u.FirstName AS firstName, 
            u.LastName AS lastName, 
            CASE 
                WHEN p.UserID = ? THEN 'user'       -- Posts from the user themselves
                WHEN p.GroupID IS NOT NULL THEN 'group' -- Posts from groups the user is a member of
                ELSE 'friend'                      -- Posts from the user's friends
            END AS source
        FROM Posts p
        JOIN Users u ON p.UserID = u.ID
        -- Join with Friends table to include posts from the user's friends
        LEFT JOIN Friends f ON (f.UserID1 = ? AND f.UserID2 = p.UserID) 
                           OR (f.UserID2 = ? AND f.UserID1 = p.UserID)
        -- Join with GroupMembers table to include posts from groups the user is in
        LEFT JOIN GroupMembers gm ON gm.UserID = p.UserID
        WHERE 
            p.UserID = ? -- Fetch the user's own posts
            OR f.ID IS NOT NULL -- Fetch posts from friends
            OR gm.GroupID IN (SELECT GroupID FROM GroupMembers WHERE UserID = ?) -- Fetch posts from groups the user is in
        ORDER BY p.CreatedAt DESC
        LIMIT 50;
    `;

    db.query(getUserFeedQuery, [userId, userId, userId, userId, userId], (err, results) => {
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