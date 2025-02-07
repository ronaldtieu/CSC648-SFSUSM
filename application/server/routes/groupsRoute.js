const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupsController');  
const userController = require('../controllers/userController');  

// Create a New Group
router.post('/create', userController.verifyToken, groupController.createGroup);

// Update Group Info
router.put('/update', userController.verifyToken, groupController.updateGroup);

// Delete a Group
router.delete('/delete', userController.verifyToken, groupController.deleteGroup);

// Add a Member to the Group
router.post('/addMember', userController.verifyToken, groupController.addMember);

// Remove a Member from the Group
router.delete('/removeMember', userController.verifyToken, groupController.removeMember);

// Request to Join a Group
router.post('/requestJoin', userController.verifyToken, groupController.requestToJoinGroup);

// Respond to a Join Request (approve or decline)
router.put('/respondJoinRequest', userController.verifyToken, groupController.respondToJoinRequest);

// Show Join Requests (for admins)
router.get('/showJoinRequests/:groupId', userController.verifyToken, groupController.showJoinRequests);

// Get Group Details
router.get('/:groupId/details', userController.verifyToken, groupController.getGroupDetails);

// Fetch Group Posts
router.get('/:groupId/posts', userController.verifyToken, groupController.getGroupPosts);

// Get All Groups
router.get('/getAllGroups', userController.verifyToken, groupController.getAllGroups);

// Get All Group Members
router.get('/getGroupMembers', userController.verifyToken, groupController.getGroupMembers);

// Get Group By ID (with details, members, and posts)
router.get('/getGroupById/:groupId', userController.verifyToken, groupController.getGroupById);

module.exports = router;