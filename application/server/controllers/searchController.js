const db = require('../config/db');
require('dotenv').config();

// Search function: searches for users and posts based on a query string.
exports.search = (req, res) => {
    const queryParam = req.query.q;
    
    if (!queryParam) {
        return res.json({
            success: false,
            message: 'Query parameter is required.',
        });
    }

    // Prepare the search term for SQL LIKE queries.
    const searchTerm = `%${queryParam}%`;

    // Object to hold combined search results.
    let results = {
        users: [],
        posts: []
    };

    // Counter to check when both queries have completed.
    let completed = 0;

    // Search for users by first name or last name.
    const userQuery = `
        SELECT 
            ID, 
            FirstName, 
            LastName, 
            Email
        FROM Users
        WHERE FirstName LIKE ? OR LastName LIKE ?
        ORDER BY FirstName, LastName
    `;
    db.query(userQuery, [searchTerm, searchTerm], (err, userRows) => {
        if (err) {
            console.error('Error searching users: ', err);
            results.users = [];
        } else {
            results.users = userRows;
        }
        completed++;
        if (completed === 2) {
            return res.json({
                success: true,
                query: queryParam,
                results: results,
            });
        }
    });

    // Search for posts by content.
    const postQuery = `
        SELECT 
            p.ID, 
            p.Content, 
            p.CreatedAt, 
            p.UserID, 
            p.Visibility, 
            p.GroupID, 
            u.FirstName, 
            u.LastName,
            GROUP_CONCAT(h.Tag) AS hashtags
        FROM Posts p
        JOIN Users u ON p.UserID = u.ID
        LEFT JOIN PostHashtags ph ON p.ID = ph.PostID
        LEFT JOIN Hashtags h ON ph.HashtagID = h.ID
        WHERE p.Content LIKE ?
        GROUP BY p.ID
        ORDER BY p.CreatedAt DESC
    `;
    db.query(postQuery, [searchTerm], (err, postRows) => {
        if (err) {
            console.error('Error searching posts: ', err);
            results.posts = [];
        } else {
            // Convert GROUP_CONCAT into an array for each post.
            results.posts = postRows.map(post => {
                post.hashtags = post.hashtags ? post.hashtags.split(',') : [];
                return post;
            });
        }
        completed++;
        if (completed === 2) {
            return res.json({
                success: true,
                query: queryParam,
                results: results,
            });
        }
    });
};