const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');  



// Create Post
router.post('/createPost', userController.verifyToken, postController.createPost);

// Create comment on post
router.post('/comments', userController.verifyToken, postController.commentOnPost);

// like a post
router.post('/likePost', userController.verifyToken, postController.likePost);

// unlike a post
router.delete('/unlikePost', userController.verifyToken, postController.unlikePost);

// get all user's post1
router.get('/getUserPosts', userController.verifyToken, postController.getUserPosts);

// get a post's likes
router.get('/:postId/likes', userController.verifyToken, postController.getPostLikes);

// get a post's comments
router.get('/:postId/comments', userController.verifyToken, postController.getPostComments);

// get specific post
router.get('/:postId', userController.verifyToken, postController.getPostById);

// delete specific post
router.delete('/:postId', userController.verifyToken, postController.deletePost);

// delete comment from specific post
router.delete('/:postId/comments/:commentId', userController.verifyToken, postController.deleteComment);

// edit post
router.put('/:postId/editPost', userController.verifyToken, postController.editPost);

// edit comment
router.put('/:postId/comments/:commentId/editComment', userController.verifyToken, postController.editComment);

// Fetching posts by hashtag
router.get('/:hashtag/posts', postController.getPostsByHashtag);



module.exports = router;