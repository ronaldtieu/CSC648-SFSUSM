const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/messageController');
const userController = require('../controllers/userController');

// Create a new conversation
router.post('/createConversation', userController.verifyToken, conversationController.createConversation);

// Send a message in a conversation
router.post('/sendMessage', userController.verifyToken, conversationController.sendMessage);

// Get all messages in a conversation
router.get('/:conversationId/messages', userController.verifyToken, conversationController.getMessages);

// Delete a conversation and all messages within it
router.delete('/:conversationId', userController.verifyToken, conversationController.deleteConversation);

// Add a user to a conversation
router.post('/addUserToConversation', userController.verifyToken, conversationController.addUserToConversation);

// Remove a user from a conversation
router.post('/removeUserFromConversation', userController.verifyToken, conversationController.removeUserFromConversation);

// Get all conversations
router.get('/allConversations', userController.verifyToken, conversationController.getAllConversations);

// all members from convo
router.get('/allMembersFromConversation', userController.verifyToken, conversationController.getConversationMembers);

module.exports = router;