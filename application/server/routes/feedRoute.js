const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const userController = require('../controllers/userController');

// Get feed for the logged-in user
router.get('/getFeed', userController.verifyToken, feedController.getUserFeed);

module.exports = router;