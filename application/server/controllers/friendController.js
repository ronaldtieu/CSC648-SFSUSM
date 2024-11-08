const bcrypt = require('bcrypt');  // Only declared once
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();



// Send a Friend Request
exports.sendRequest = (req, res) => {
    const senderId = req.userId; 
    const { receiverId } = req.body;

    if (!receiverId) {
        return res.json({
            success: false,
            message: 'Receiver ID is required.',
        });
    }

    const receiverCheckQuery = `
        SELECT COUNT(*) AS count FROM Users WHERE ID = ?
    `;

    db.query(receiverCheckQuery, [receiverId], (err, receiverResult) => {
        if (err) {
            console.error('Error checking receiver existence:', err);
            return res.json({
                success: false,
                message: 'Database query error while checking receiver existence.',
            });
        }

        if (receiverResult[0].count === 0) {
            return res.json({
                success: false,
                message: 'Receiver does not exist.',
            });
        }

        const friendshipQuery = `
            SELECT COUNT(*) AS count FROM Friends 
            WHERE (UserID1 = ? AND UserID2 = ?) OR (UserID1 = ? AND UserID2 = ?)
        `;

        db.query(friendshipQuery, [senderId, receiverId, receiverId, senderId], (err, friendshipResult) => {
            if (err) {
                console.error('Error checking friendship:', err);
                return res.json({
                    success: false,
                    message: 'Failed to check friendship. DB query error checking friendship',
                });
            }

            if (friendshipResult[0].count > 0) {
                return res.json({
                    success: false,
                    message: 'You are already friends.',
                });
            }

            const requestQuery = `
                SELECT COUNT(*) AS count FROM FriendRequests 
                WHERE SenderID = ? AND ReceiverID = ? AND Status = 'pending'
            `;

            db.query(requestQuery, [senderId, receiverId], (err, requestResult) => {
                if (err) {
                    console.error('Error checking existing friend request:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to check existing friend request. Query error checking for existing friend',
                    });
                }

                if (requestResult[0].count > 0) {
                    return res.json({
                        success: false,
                        message: 'Friend request already sent and pending.',
                    });
                }

                const insertQuery = `
                    INSERT INTO FriendRequests (SenderID, ReceiverID, Status) 
                    VALUES (?, ?, 'pending')
                `;

                db.query(insertQuery, [senderId, receiverId], (err, insertResult) => {
                    if (err) {
                        console.error('Error inserting friend request:', err);
                        return res.json({
                            success: false,
                            message: 'Failed to send friend request. Error with the query for inserting friend request',
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Friend request sent.',
                    });
                });
            });
        });
    });
};

// Accept a Friend Request
exports.acceptRequest = (req, res) => {
    const { requestId } = req.body;

    if (!requestId) {
        return res.json({
            success: false,
            message: 'Friend request ID is required.',
        });
    }

    const updateRequestQuery = `
        UPDATE FriendRequests SET Status = 'accepted' WHERE ID = ?
    `;

    db.query(updateRequestQuery, [requestId], (err, updateResult) => {
        if (err) {
            console.error('Error updating friend request status:', err);
            return res.json({
                success: false,
                message: 'Failed to accept friend request.',
            });
        }

        if (updateResult.affectedRows === 0) {
            return res.json({
                success: false,
                message: 'Friend request not found.',
            });
        }

        const getRequestQuery = `
            SELECT SenderID, ReceiverID FROM FriendRequests WHERE ID = ?
        `;

        db.query(getRequestQuery, [requestId], (err, requestResult) => {
            if (err || requestResult.length === 0) {
                console.error('Error retrieving friend request details:', err);
                return res.json({
                    success: false,
                    message: 'Failed to retrieve friend request details.',
                });
            }

            const { SenderID, ReceiverID } = requestResult[0];

            const insertFriendQuery = `
                INSERT INTO Friends (UserID1, UserID2) VALUES (?, ?)
            `;

            db.query(insertFriendQuery, [SenderID, ReceiverID], (err) => {
                if (err) {
                    console.error('Error creating friendship:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to create friendship.',
                    });
                }

                // Delete the friend request after acceptance
                const deleteRequestQuery = `
                    DELETE FROM FriendRequests WHERE ID = ?
                `;

                db.query(deleteRequestQuery, [requestId], (err) => {
                    if (err) {
                        console.error('Error deleting friend request:', err);
                        return res.json({
                            success: false,
                            message: 'Failed to delete friend request after acceptance.',
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Friend request accepted and deleted.',
                    });
                });
            });
        });
    });
};

// Decline a Friend Request
exports.declineRequest = (req, res) => {
    const { requestId } = req.body;

    if (!requestId) {
        return res.json({
            success: false,
            message: 'Friend request ID is required.',
        });
    }

    const updateRequestQuery = `
        UPDATE FriendRequests SET Status = 'declined' WHERE ID = ?
    `;

    db.query(updateRequestQuery, [requestId], (err, result) => {
        if (err) {
            console.error('Error declining friend request:', err);
            return res.json({
                success: false,
                message: 'Failed to decline friend request.',
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: 'Friend request not found.',
            });
        }

        const deleteRequestQuery = `
            DELETE FROM FriendRequests WHERE ID = ?
        `;

        db.query(deleteRequestQuery, [requestId], (err) => {
            if (err) {
                console.error('Error deleting declined friend request:', err);
                return res.json({
                    success: false,
                    message: 'Failed to delete friend request after declining.',
                });
            }

            res.json({
                success: true,
                message: 'Friend request declined and deleted.',
            });
        });
    });
};

// Remove a Friend
exports.removeFriend = (req, res) => {
    const { friendId } = req.body;
    const userId = req.userId;  

    if (!friendId) {
        return res.json({
            success: false,
            message: 'Friend ID is required.',
        });
    }

    const deleteFriendQuery = `
        DELETE FROM Friends 
        WHERE (UserID1 = ? AND UserID2 = ?) OR (UserID1 = ? AND UserID2 = ?)
    `;

    db.query(deleteFriendQuery, [userId, friendId, friendId, userId], (err, result) => {
        if (err) {
            console.error('Error removing friend:', err);
            return res.json({
                success: false,
                message: 'Failed to remove friend.',
            });
        }

        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: 'Friendship not found.',
            });
        }

        res.json({
            success: true,
            message: 'Friend removed successfully.',
        });
    });
};

// List Friends
exports.listFriends = (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.json({
            success: false,
            message: 'Error with userId',
        });
    }

    const query = `
        SELECT Users.ID AS FriendID, Users.FirstName, Users.LastName, Users.Email 
        FROM Friends
        JOIN Users ON (Users.ID = CASE 
                                  WHEN Friends.UserID1 = ? THEN Friends.UserID2 
                                  ELSE Friends.UserID1 
                              END)
        WHERE Friends.UserID1 = ? OR Friends.UserID2 = ?
    `;

    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error with list friends query:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve friends. Please try again later.',
            });
        }

        res.json({
            success: true,
            friends: results,
        });
    });
};

// List Friend Requests
exports.listFriendRequests = (req, res) => {
    const userId = req.userId; 

    if (!userId) {
        return res.json({
            success: false,
            message: 'User ID is required.',
        });
    }

    const query = `
        SELECT 
            FriendRequests.ID AS requestId,
            FriendRequests.SenderID,
            FriendRequests.ReceiverID,
            FriendRequests.Status,
            Users.FirstName AS senderFirstName,
            Users.LastName AS senderLastName,
            Recipients.FirstName AS receiverFirstName,
            Recipients.LastName AS receiverLastName
        FROM FriendRequests
        JOIN Users ON FriendRequests.SenderID = Users.ID
        JOIN Users AS Recipients ON FriendRequests.ReceiverID = Recipients.ID
        WHERE FriendRequests.SenderID = ? OR FriendRequests.ReceiverID = ?
        ORDER BY FriendRequests.CreatedAt DESC
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error('Error retrieving friend requests:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve friend requests. Please try again later.',
            });
        }

        res.json({
            success: true,
            friendRequests: results, 
        });
    });
};