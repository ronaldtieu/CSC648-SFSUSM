const bcrypt = require('bcrypt');  // Only declared once
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { post } = require('../routes/userRoutes');
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
    const query = `INSERT INTO Posts (UserID, Content) VALUES (?, ?)`;

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
exports.getUserPosts = (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.json({ success: false, message: 'Error with userId' });
    }

    const query = `
        SELECT Posts.ID, Posts.Content, Posts.CreatedAt, Posts.UserID, Users.FirstName, Users.LastName
        FROM Posts
        JOIN Users ON Posts.UserID = Users.ID
        WHERE Posts.UserID = ?
        ORDER BY Posts.CreatedAt DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error with user post query: ', err);
            return res.json({ success: false, message: 'Failed to retrieve posts.' });
        }
        res.json({ success: true, posts: results });
    });
};

// Like posts
exports.likePost = (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;

    if (!postId) {
        return res.json({
            success: false,
            message: 'Error with postId during liking post',
        });
    }

    // First, check if the user has already liked the post
    const checkQuery = `SELECT * FROM Likes WHERE UserID = ? AND PostID = ?`;
    db.query(checkQuery, [userId, postId], (err, results) => {
        if (err) {
            console.error('Error checking like status: ', err);
            return res.json({
                success: false,
                message: 'Error db query when checking if the user has already liked the post.',
            });
        }

        if (results.length > 0) {
            // User has already liked the post, so don't insert again
            return res.json({
                success: false,
                message: 'User has already liked this post.',
            });
        }

        // User hasn't liked the post yet, so proceed with the like
        const insertQuery = `INSERT INTO Likes (UserID, PostID) VALUES (?, ?)`;
        db.query(insertQuery, [userId, postId], (err, results) => {
            if (err) {
                console.error('Error liking post: ', err);
                return res.json({
                    success: false,
                    message: 'Error with query during liking post',
                });
            }
            res.json({
                success: true,
                message: 'Post liked successfully!',
            });
        });
    });
};

// Unlike post
exports.unlikePost = (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;

    if (!postId) {
        return res.json({
            success: false,
            message: 'Error with postId during unliking post',
        });
    }

    // First, check if the user has liked the post
    const checkQuery = `SELECT * FROM Likes WHERE UserID = ? AND PostID = ?`;
    db.query(checkQuery, [userId, postId], (err, results) => {
        if (err) {
            console.error('Error checking like status: ', err);
            return res.json({
                success: false,
                message: 'db query error when checking if the user has liked the post.',
            });
        }

        if (results.length === 0) {
            // User has not liked the post, so return an error message
            return res.json({
                success: false,
                message: 'User has not liked this post.',
            });
        }

        // the user has liked the post, so proceed with removing their like
        const deleteQuery = `DELETE FROM Likes WHERE UserID = ? AND PostID = ?`;
        db.query(deleteQuery, [userId, postId], (err, deleteResults) => {
            if (err) {
                console.error('Error unliking post: ', err);
                return res.json({
                    success: false,
                    message: 'Error with query during unliking post',
                });
            }

            // Check if the post was successfully unliked
            if (deleteResults.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: 'No like found for this post by the user.',
                });
            }

            res.json({
                success: true,
                message: 'Post unliked successfully',
            });
        });
    });
};

// comment on post
exports.commentOnPost = (req, res) => {
    const userId = req.userId;
    const { postId, comment } = req.body;

    // console.log('User ID:', userId);
    // console.log('Post ID:', postId);
    // console.log('Comment:', comment);

    // checking if postId and comments are provided
    if(!postId || !comment || comment.trim() === '') {
        return res.json ({
            success: false,
            message: 'Error with postId or comment',
        });
    }
    
    const query = `INSERT INTO Comments (UserID, PostID, Content) VALUES (?, ?, ?)`;

    db.query(query, [userId, postId, comment], (err, results) => {
        if(err) {
            console.error('Error commenting on post:', err);
            return res.json({
                success: false,
                message: 'Error with db query during commenting on post.',
            });
        }
        res.json({
            success: true,
            message: 'Comment added successfully.',
        });
    });
};

// get likes from post w/ total # of likes
exports.getPostLikes = (req, res) => {
    const { postId } = req.params;
  
    if (!postId) {
      return res.json({
        success: false,
        message: 'Error with PostId when getting Post likes',
      });
    }
  
    // First query: Get the list of users who liked the post
    const userLikesQuery = `
      SELECT Users.ID, Users.FirstName, Users.LastName
      FROM Likes
      JOIN Users ON Likes.UserID = Users.ID
      WHERE Likes.PostID = ?
    `;
  
    // Second query: Get the total number of likes
    const totalLikesQuery = `
      SELECT COUNT(*) AS totalLikes
      FROM Likes
      WHERE Likes.PostID = ?
    `;
  
    // Execute the first query to get users who liked the post
    db.query(userLikesQuery, [postId], (err, userResults) => {
      if (err) {
        console.error('Error retrieving users who liked the post:', err);
        return res.json({
          success: false,
          message: 'Error with query for getting post likes.',
        });
      }
  
      // Execute the second query to get the total number of likes
      db.query(totalLikesQuery, [postId], (err, totalLikesResults) => {
        if (err) {
          console.error('Error retrieving total likes:', err);
          return res.json({
            success: false,
            message: 'Error with query for getting total likes.',
          });
        }
  
        const totalLikes = totalLikesResults[0].totalLikes;
  
        // Send the response with both users who liked the post and totalLikes
        res.json({
          success: true,
          likes: userResults,  
          totalLikes: totalLikes,  
        });
      });
    });
  };

// get comments from post
exports.getPostComments = (req, res) => {
    const { postId } = req.params;

    if (!postId) {
        return res.json({
            success: false,
            message: 'Error with PostId when getting comments from post',
        });
    }

    const query = `
    SELECT 
        Comments.ID, 
        Comments.Content AS Comment, 
        Comments.CreatedAt, 
        Comments.UserID, 
        Users.FirstName, 
        Users.LastName
    FROM Comments
    JOIN Users ON Comments.UserID = Users.ID
    WHERE Comments.PostId = ?
    ORDER BY Comments.CreatedAt DESC`;

    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error retrieving comments:', err);
            return res.json({
                success: false,
                message: 'Query error when getting comments for post.'
            });
        }

        res.json({
            success: true,
            comments: results.map(comment => ({
                id: comment.ID,
                userId: comment.UserID, 
                firstName: comment.FirstName,
                lastName: comment.LastName,
                content: comment.Comment,
                createdAt: comment.CreatedAt,
            })),
        });
    });
};

// getting specific post 
exports.getPostById = (req, res) => {
    const { postId } = req.params;


    if (!postId) {
        return res.json({
            success: false,
            message: 'Error with postId',
        });
    }

    const query = `
        SELECT Posts.ID, Posts.Content, Posts.CreatedAt, Users.FirstName, Users.LastName
        FROM Posts
        JOIN Users ON Posts.UserID = Users.ID
        WHERE Posts.ID = ?
    `;

    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error retrieving post: ', err);
            return res.json({
                success: false,
                message: 'Error with db query.',
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'Post not found',
            });
        }

        res.json({
            success: true,
            post: results[0], 
        });
    });
};


// add delete post 
exports.deletePost = (req, res) => {
    const userId = req.userId;  // UserID from JWT token (assumed extracted in middleware)
    const { postId } = req.params;  // PostID from the request URL

    // Check if postId is provided
    if (!postId) {
        return res.json({
            success: false,
            message: 'Error with postId',
        });
    }

    // SQL query to check if the post belongs to the user
    const checkQuery = `SELECT * FROM Posts WHERE ID = ? AND UserID = ?`;

    db.query(checkQuery, [postId, userId], (err, results) => {
        if (err) {
            console.error('Error verifying post ownership: ', err);
            return res.json({
                success: false,
                message: 'Error verifying post ownership.',
            });
        }

        if (results.length === 0) {
            // User doesn't own the post or the post doesn't exist
            return res.json({
                success: false,
                message: 'No post found or user is not the owner of the post.',
            });
        }

        // Proceed to delete the post if ownership is verified
        const deleteQuery = `DELETE FROM Posts WHERE ID = ? AND UserID = ?`;
        db.query(deleteQuery, [postId, userId], (err, deleteResults) => {
            if (err) {
                console.error('Error deleting post: ', err);
                return res.json({
                    success: false,
                    message: 'Error deleting post.',
                });
            }

            // Successfully deleted the post
            res.json({
                success: true,
                message: 'Post deleted successfully.',
            });
        });
    });
};

// delete a comment from post
exports.deleteComment = (req, res) => {
    const userId = req.userId;  
    const { commentId, postId } = req.params;  

    if (!commentId || !postId) {
        return res.json({
            success: false,
            message: 'Error with commentId or postId',
        });
    }

    // Updated column names to lowercase
    const checkQuery = `SELECT * FROM Comments WHERE id = ? AND postId = ? AND userId = ?`;

    db.query(checkQuery, [commentId, postId, userId], (err, results) => {
        if (err) {
            console.error('Error verifying comment ownership: ', err);
            return res.json({
                success: false,
                message: 'Error verifying comment ownership.',
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'No comment found for this post or user is not the owner of the comment.',
            });
        }

        const deleteQuery = `DELETE FROM Comments WHERE id = ? AND postId = ? AND userId = ?`;
        db.query(deleteQuery, [commentId, postId, userId], (err, deleteResults) => {
            if (err) {
                console.error('Error deleting comment: ', err);
                return res.json({
                    success: false,
                    message: 'Error deleting comment.',
                });
            }

            if (deleteResults.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: 'Failed to delete the comment.',
                });
            }

            res.json({
                success: true,
                message: 'Comment deleted successfully.',
            });
        });
    });
};

// edit post
exports.editPost = (req, res) => {
    const userId = req.userId;  
    const { postId } = req.params;
    const { content } = req.body;

    if (!postId || !content || content.trim() === '') {
        return res.json({
            success: false,
            message: 'Error with postId or post content',
        });
    }

    const checkQuery = `SELECT * FROM Posts WHERE ID = ? AND UserID = ?`;

    db.query(checkQuery, [postId, userId], (err, results) => {
        if (err) {
            console.error('Error verifying post ownership: ', err);
            return res.json({
                success: false,
                message: 'Error verifying post ownership.',
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'No post found or user is not the owner of the post.',
            });
        }

        const updateQuery = `UPDATE Posts SET Content = ? WHERE ID = ? AND UserID = ?`;
        db.query(updateQuery, [content, postId, userId], (err, updateResults) => {
            if (err) {
                console.error('Error updating post: ', err);
                return res.json({
                    success: false,
                    message: 'Error updating post content.',
                });
            }

            res.json({
                success: true,
                message: 'Post updated successfully.',
            });
        });
    });
};

// edit comment
exports.editComment = (req, res) => {
    const userId = req.userId; 
    const { commentId } = req.params;
    const { content } = req.body;

    // console.log("Incoming request to edit comment.");
    // console.log(`- Session User ID: ${userId}`);
    // console.log(`- Comment ID: ${commentId}`);

    if (!commentId || !content || content.trim() === '') {
        return res.json({
            success: false,
            message: 'Error with commentId or comment content',
        });
    }

    const checkQuery = `SELECT * FROM Comments WHERE ID = ?`;
    db.query(checkQuery, [commentId], (err, results) => {
        if (err) {
            console.error('Error verifying comment ownership:', err);
            return res.json({
                success: false,
                message: 'Error verifying comment ownership.',
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: 'No comment found with this ID.',
            });
        }

        const commentOwnerId = results[0].UserID;
        // console.log(`- Comment Owner User ID: ${commentOwnerId}`);

        if (Number(commentOwnerId) !== Number(userId)) {
            return res.json({
                success: false,
                message: 'User is not the owner of the comment.',
            });
        }

        const updateQuery = `UPDATE Comments SET Content = ? WHERE ID = ? AND UserID = ?`;
        db.query(updateQuery, [content, commentId, userId], (err, updateResults) => {
            if (err) {
                console.error('Error updating comment:', err);
                return res.json({
                    success: false,
                    message: 'Error updating comment content.',
                });
            }

            res.json({
                success: true,
                message: 'Comment updated successfully.',
            });
        });
    });
};

