const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const session = require('../config/session');
const { validateProfileEdit } = require('../middlewares/validateProfileEdit');

// Route for user registration with automatic login
router.post('/register', userController.registerUser);

// Route for user login
router.post('/login', userController.loginUser);

// Route for user logout
router.post('/logout', userController.verifyToken, userController.logoutUser);

// Route to check user session status
router.get('/check-session', session.checkAuth); // Changed to checkAuth for JWT

// Route to edit user profile
router.put(
    '/edit-profile',
    userController.verifyToken, // Ensure the user is authenticated with JWT
    validateProfileEdit,
    userController.editUserProfile
);

router.delete('/clear-blacklist', userController.clearBlacklist);

router.get('/getBlackList', userController.getAllBlacklistedTokens);

module.exports = router;