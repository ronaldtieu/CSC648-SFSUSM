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
                WHEN p.UserID = ? THEN 'user'
                WHEN p.GroupID IS NOT NULL THEN 'group'
                WHEN f.ID IS NOT NULL THEN 'friend'
                ELSE 'public'
            END AS source
        FROM Posts p
        JOIN Users u ON p.UserID = u.ID
        LEFT JOIN Friends f 
            ON (f.UserID1 = ? AND f.UserID2 = p.UserID)
            OR (f.UserID2 = ? AND f.UserID1 = p.UserID)
        WHERE 
            p.UserID = ?
            OR (p.GroupID IS NOT NULL AND p.GroupID IN (
                    SELECT GroupID FROM GroupMembers WHERE UserID = ?
                ))
            OR (f.ID IS NOT NULL)
            OR (p.Visibility = 'public' 
                AND p.GroupID IS NULL 
                AND f.ID IS NULL 
                AND p.UserID <> ?)
        ORDER BY p.CreatedAt DESC
        LIMIT 50;
    `;

    db.query(getUserFeedQuery, [userId, userId, userId, userId, userId, userId], (err, results) => {
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