const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');  

// Use verifyToken for post-related routes
router.post('/createPost', userController.verifyToken, postController.createPost);
router.get('/getUserPosts', userController.verifyToken, postController.getUserPosts);

module.exports = router;