const bcrypt = require('bcrypt');  // Only declared once
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Create posts
exports.createPost = (req, res) => {
    const userId = req.userId;  // Assuming you extract userId from a JWT token in middleware

    // Check if userId exists
    if (!userId) {
        return res.json({
            success: false,
            message: 'Error with userId',
        });
    }

    const { content } = req.body;  // Extract content from the request body

    // Check if content is provided and not empty
    if (!content || content.trim() === '') {
        return res.json({
            success: false,
            message: 'Post content cannot be empty',
        });
    }

    // SQL query to insert the post into the Posts table
    const query = 'INSERT INTO Posts (UserID, Content) VALUES (?, ?)';

    db.query(query, [userId, content], (err, results) => {
        if (err) {
            console.error('Error inserting post: ', err);
            return res.json({
                success: false,
                message: 'Failed to create post. Please try again later.',
            });
        }

        // If post was successfully created, return success message and postId
        res.json({
            success: true,
            message: 'Post created successfully!',
            postId: results.insertId  // Return the ID of the newly created post
        });
    });
};

// Get all user's post
exports.getUserPosts = (req, res ) => {
    const userId = req.userId;

    if (!userId) {
        return res.json({
            success: false,
            message: 'Error with userId',
        });
    }

    const query = `
        SELECT Posts.ID, Posts.Content, Posts.CreatedAt, Users.FirstName, Users.LastName
        FROM Posts
        JOIN Users ON Posts.UserID = Users.ID
        WHERE Posts.UserID = ?
        ORDER BY Posts.CreatedAt DESC
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error with user post query: ', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve posts. Please try again later.',
            });
        }
        res.json({
            success: true,
            posts: results,
        });
    });
};