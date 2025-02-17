const db = require('../config/db');
require('dotenv').config();

// Create a new conversation between users
exports.createConversation = (req, res) => {
    const senderId = req.userId;
    const { receiverIds } = req.body;

    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
        return res.json({
            success: false,
            message: 'At least one receiver ID is required to create a conversation.',
        });
    }

    const participants = [senderId, ...receiverIds];

    // Check the participant limit (10 users max)
    if (participants.length > 10) {
        return res.json({
            success: false,
            message: 'A conversation can have a maximum of 10 users.',
        });
    }

    const existingConversationQuery = `
        SELECT cp.ConversationID
        FROM ConversationParticipants cp
        JOIN (
            SELECT ConversationID
            FROM ConversationParticipants
            WHERE UserID IN (?)
            GROUP BY ConversationID
            HAVING COUNT(UserID) = ?
        ) AS groupedConversations
        ON cp.ConversationID = groupedConversations.ConversationID
        GROUP BY cp.ConversationID
        HAVING COUNT(cp.UserID) = ?;
    `;

    db.query(existingConversationQuery, [participants, participants.length, participants.length], (err, results) => {
        if (err) {
            console.error('Error checking for existing conversation:', err);
            return res.json({
                success: false,
                message: 'Error checking for existing conversation.',
            });
        }

        if (results.length > 0) {
            // If a conversation exists, return its ID
            return res.json({
                success: true,
                message: 'Conversation already exists.',
                conversationId: results[0].ConversationID,
            });
        }

        const createConversationQuery = `INSERT INTO Conversations () VALUES ()`;

        db.query(createConversationQuery, (err, result) => {
            if (err) {
                console.error('Error creating conversation:', err);
                return res.json({
                    success: false,
                    message: 'Failed to create conversation.',
                });
            }

            const conversationId = result.insertId;

            const addParticipantsQuery = `
                INSERT INTO ConversationParticipants (ConversationID, UserID) VALUES ?
            `;
            const participantValues = participants.map(userId => [conversationId, userId]);

            db.query(addParticipantsQuery, [participantValues], (err) => {
                if (err) {
                    console.error('Error adding participants:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to add participants to conversation.',
                    });
                }

                res.json({
                    success: true,
                    message: 'Conversation created successfully with participants.',
                    conversationId,
                });
            });
        });
    });
};

// Send a message within a conversation
exports.sendMessage = (req, res) => {
    const senderId = req.userId; 
    const { conversationId, messageContent } = req.body;

    // Check if message content is provided
    if (!messageContent) {
        return res.json({
            success: false,
            message: 'Message content is required.',
        });
    }

    const query = `
        INSERT INTO Messages (ConversationID, SenderID, Content)
        VALUES (?, ?, ?)
    `;

    db.query(query, [conversationId, senderId, messageContent], (err, result) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.json({
                success: false,
                message: 'Failed to send message.',
            });
        }

        res.json({
            success: true,
            message: 'Message sent successfully.',
            messageId: result.insertId,
        });
    });
};

exports.getMessages = (req, res) => {
    const userId = req.userId; 
    const { conversationId } = req.params;

    console.log("getMessages endpoint called with:");
    console.log("req.userId:", userId);
    console.log("Conversation ID:", conversationId);

    const checkParticipantQuery = `
        SELECT COUNT(*) AS isParticipant
        FROM ConversationParticipants
        WHERE ConversationID = ? AND UserID = ?
    `;

    db.query(checkParticipantQuery, [conversationId, userId], (err, participantResult) => {
        if (err) {
            console.error('Error checking conversation participation:', err);
            return res.json({
                success: false,
                message: 'Failed to verify conversation participation.',
            });
        }

        console.log("Query result for participant check:", participantResult);
        if (participantResult[0].isParticipant === 0) {
            console.error(`Access denied for user ${userId} on conversation ${conversationId}`);
            return res.json({
                success: false,
                message: 'Access denied. You are not a participant in this conversation.',
            });
        }

        const getMessagesQuery = `
            SELECT Messages.ID, Messages.Content, Messages.SenderID, Messages.SentAt, 
                   Users.FirstName AS SenderFirstName, Users.LastName AS SenderLastName
            FROM Messages
            JOIN Users ON Messages.SenderID = Users.ID
            WHERE ConversationID = ?
            ORDER BY Messages.SentAt ASC
        `;

        db.query(getMessagesQuery, [conversationId], (err, messagesResult) => {
            if (err) {
                console.error('Error retrieving messages:', err);
                return res.json({
                    success: false,
                    message: 'Failed to retrieve messages.',
                });
            }

            const messages = messagesResult.map(message => ({
                messageId: message.ID,
                content: message.Content,
                senderId: message.SenderID,
                senderFirstName: message.SenderFirstName,
                senderLastName: message.SenderLastName,
                sentAt: message.SentAt,
            }));

            res.json({
                success: true,
                messages: messages,
            });
        });
    });
};

// Delete a conversation and all associated messages
exports.deleteConversation = (req, res) => {
    const { conversationId } = req.params;

    const checkConversationQuery = `
        SELECT COUNT(*) AS count FROM Conversations
        WHERE ID = ?
    `;

    db.query(checkConversationQuery, [conversationId], (err, result) => {
        if (err) {
            console.error('Error checking conversation existence:', err);
            return res.json({
                success: false,
                message: 'Failed to check conversation existence.',
            });
        }

        if (result[0].count === 0) {
            return res.json({
                success: false,
                message: 'Conversation not found.',
            });
        }

        const deleteMessagesQuery = `
            DELETE FROM Messages
            WHERE ConversationID = ?
        `;

        db.query(deleteMessagesQuery, [conversationId], (err) => {
            if (err) {
                console.error('Error deleting messages:', err);
                return res.json({
                    success: false,
                    message: 'Failed to delete messages within the conversation.',
                });
            }

            const deleteConversationQuery = `
                DELETE FROM Conversations
                WHERE ID = ?
            `;

            db.query(deleteConversationQuery, [conversationId], (err) => {
                if (err) {
                    console.error('Error deleting conversation:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to delete conversation.',
                    });
                }

                res.json({
                    success: true,
                    message: 'Conversation and messages deleted successfully.',
                });
            });
        });
    });
};

// Add a user to a conversation (group chat)
exports.addUserToConversation = (req, res) => {
    const { conversationId, userId } = req.body;

    // Step 1: Check if the user exists
    const userCheckQuery = `
        SELECT COUNT(*) AS count FROM Users WHERE ID = ?
    `;

    db.query(userCheckQuery, [userId], (err, userResult) => {
        if (err) {
            console.error('Error checking user existence:', err);
            return res.json({
                success: false,
                message: 'Database error while checking user existence.',
            });
        }

        if (userResult[0].count === 0) {
            return res.json({
                success: false,
                message: 'User does not exist.',
            });
        }

        // Step 2: Check if the conversation exists
        const conversationCheckQuery = `
            SELECT COUNT(*) AS count FROM Conversations WHERE ID = ?
        `;

        db.query(conversationCheckQuery, [conversationId], (err, conversationResult) => {
            if (err) {
                console.error('Error checking conversation existence:', err);
                return res.json({
                    success: false,
                    message: 'Database error while checking conversation existence.',
                });
            }

            if (conversationResult[0].count === 0) {
                return res.json({
                    success: false,
                    message: 'Conversation does not exist.',
                });
            }

            // Step 3: Add the user to the conversation participants
            const addParticipantQuery = `
                INSERT INTO ConversationParticipants (ConversationID, UserID)
                VALUES (?, ?)
            `;

            db.query(addParticipantQuery, [conversationId, userId], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.json({
                            success: false,
                            message: 'User is already a member of the conversation.',
                        });
                    }
                    console.error('Error adding user to conversation:', err);
                    return res.json({
                        success: false,
                        message: 'Failed to add user to conversation.',
                    });
                }

                res.json({
                    success: true,
                    message: 'User added to the conversation successfully.',
                });
            });
        });
    });
};

// Remove a user from a conversation (group chat)
exports.removeUserFromConversation = (req, res) => {
    const { conversationId, userIdToRemove } = req.body;

    // Validate input
    if (!conversationId || !userIdToRemove) {
        return res.json({
            success: false,
            message: 'Conversation ID and user ID to remove are required.'
        });
    }

    // Step 1: Check if the user is part of the conversation
    const checkUserQuery = `
        SELECT * FROM ConversationParticipants
        WHERE ConversationID = ? AND UserID = ?
    `;
    db.query(checkUserQuery, [conversationId, userIdToRemove], (err, checkResult) => {
        if (err) {
            console.error('Error checking user in conversation:', err);
            return res.json({
                success: false,
                message: 'Database error while checking user in conversation.'
            });
        }
        if (checkResult.length === 0) {
            return res.json({
                success: false,
                message: 'User not found in the conversation.'
            });
        }

        // Step 2: Remove the user from the conversation
        const deleteUserQuery = `
            DELETE FROM ConversationParticipants
            WHERE ConversationID = ? AND UserID = ?
        `;
        db.query(deleteUserQuery, [conversationId, userIdToRemove], (err, result) => {
            if (err) {
                console.error('Error removing user from conversation:', err);
                return res.json({
                    success: false,
                    message: 'Failed to remove user from conversation.'
                });
            }

            res.json({
                success: true,
                message: 'User removed from conversation successfully.'
            });
        });
    });
};

// Get all conversations for the logged-in user
exports.getAllConversations = (req, res) => {
    const userId = req.userId;  

    if (!userId) {
        return res.json({
            success: false,
            message: 'User ID is required.',
        });
    }

    const query = `
        SELECT c.ID AS conversationId, c.CreatedAt AS conversationCreatedAt,
               u.ID AS participantId, u.FirstName, u.LastName
        FROM Conversations c
        JOIN ConversationParticipants cp ON c.ID = cp.ConversationID
        JOIN Users u ON cp.UserID = u.ID
        WHERE c.ID IN (
            SELECT ConversationID
            FROM ConversationParticipants
            WHERE UserID = ?
        )
        ORDER BY c.CreatedAt DESC;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving conversations:', err);
            return res.json({
                success: false,
                message: 'Failed to retrieve conversations. Please try again later.',
            });
        }

        const conversations = {};
        results.forEach(row => {
            const { conversationId, conversationCreatedAt, participantId, FirstName, LastName } = row;
            
            if (!conversations[conversationId]) {
                conversations[conversationId] = {
                    conversationId,
                    createdAt: conversationCreatedAt,
                    participants: []
                };
            }

            conversations[conversationId].participants.push({
                participantId,
                FirstName,
                LastName
            });
        });

        res.json({
            success: true,
            conversations: Object.values(conversations),
        });
    });
};

// get ALL members from convo and check if current is a participant
exports.getConversationMembers = (req, res) => {
    const { conversationId } = req.params;
    const currentUserId = req.userId;
  
    if (!conversationId || !currentUserId) {
      return res.json({
        success: false,
        message: 'Conversation ID and User ID are required.',
      });
    }
  
    const query = `
      SELECT Users.ID AS userId, Users.FirstName, Users.LastName
      FROM ConversationParticipants
      JOIN Users ON ConversationParticipants.UserID = Users.ID
      WHERE ConversationParticipants.ConversationID = ?
    `;
  
    db.query(query, [conversationId], (err, results) => {
      if (err) {
        console.error('Error retrieving conversation members:', err);
        return res.json({
          success: false,
          message: 'Failed to retrieve conversation members.',
        });
      }
  
      const isParticipant = results.some(member => member.userId === currentUserId);
  
      if (!isParticipant) {
        return res.json({
          success: false,
          message: 'Access denied. You are not a participant in this conversation.',
        });
      }
  
      return res.json({
        success: true,
        members: results,
        currentUserId,
        isParticipant, // This will be true at this point
      });
    });
};

exports.checkExistingConversation = (req, res) => {
    const senderId = req.userId;
    const { receiverIds } = req.body;
    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.json({
        success: false,
        message: 'At least one receiver ID is required to check conversation.'
      });
    }
    const participants = [senderId, ...receiverIds];
    
    const existingConversationQuery = `
      SELECT cp.ConversationID
      FROM ConversationParticipants cp
      JOIN (
        SELECT ConversationID
        FROM ConversationParticipants
        WHERE UserID IN (?)
        GROUP BY ConversationID
        HAVING COUNT(UserID) = ?
      ) AS groupedConversations
      ON cp.ConversationID = groupedConversations.ConversationID
      GROUP BY cp.ConversationID
      HAVING COUNT(cp.UserID) = ?;
    `;
    
    db.query(existingConversationQuery, [participants, participants.length, participants.length], (err, results) => {
      if (err) {
        console.error('Error checking for existing conversation:', err);
        return res.json({
          success: false,
          message: 'Error checking for existing conversation.'
        });
      }
      if (results.length > 0) {
        return res.json({
          success: true,
          conversationId: results[0].ConversationID
        });
      } else {
        return res.json({
          success: false,
          message: 'No conversation found.'
        });
      }
    });
};