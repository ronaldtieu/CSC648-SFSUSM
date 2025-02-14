const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');

// Create a new conversation
router.post('/createConversation', userController.verifyToken, messageController.createConversation);

// Send a message in a conversation
router.post('/sendMessage', userController.verifyToken, messageController.sendMessage);

// Get all messages in a conversation
router.get('/:conversationId/messages', userController.verifyToken, messageController.getMessages);

// Delete a conversation and all messages within it
router.delete('/:conversationId', userController.verifyToken, messageController.deleteConversation);

// Add a user to a conversation
router.post('/addUserToConversation', userController.verifyToken, messageController.addUserToConversation);

// Remove a user from a conversation
router.post('/removeUserFromConversation', userController.verifyToken, messageController.removeUserFromConversation);

// Get all conversations
router.get('/allConversations', userController.verifyToken, messageController.getAllConversations);

// all members from convo
router.get('/allMembersFromConversation/:conversationId', userController.verifyToken, messageController.getConversationMembers);

// checking if a conversation already exisits
router.post('/checkExistingConversation', userController.verifyToken, messageController.checkExistingConversation);


module.exports = router;