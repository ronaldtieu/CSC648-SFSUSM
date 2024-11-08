const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const userController = require('../controllers/userController');  


// send friend request
router.post('/sendReq', userController.verifyToken, friendController.sendRequest);

// accept friend request
router.post('/acceptReq', userController.verifyToken, friendController.acceptRequest);

// decline friend req
router.post('/declineReq', userController.verifyToken, friendController.declineRequest);

// remove friend reqs
router.delete('/removeFriend', userController.verifyToken, friendController.removeFriend);

// get list of friends
router.get('/listFriends', userController.verifyToken, friendController.listFriends);

// list of friend requests
router.get('/listFriendReq', userController.verifyToken, friendController.listFriendRequests);


module.exports = router;