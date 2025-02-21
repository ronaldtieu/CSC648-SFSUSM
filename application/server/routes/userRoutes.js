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
router.get('/check-session', userController.verifyToken, (req, res) => {
    if (req.sessionStatus) {
        return res.json(req.sessionStatus);
    }
    return res.json({
        success: false,
        message: 'Unknown error in session checking.',
    });
});

// Get user info
router.get('/userInfo', userController.verifyToken, userController.getUserInfo);

// Route to edit user profile
router.put(
    '/edit-profile',
    userController.verifyToken, // Ensure the user is authenticated with JWT
    validateProfileEdit,
    userController.editUserProfile
);

router.delete('/clear-blacklist', userController.clearBlacklist);

router.get('/getBlackList', userController.getAllBlacklistedTokens);

// to show all the cookies to troubleshoot login
router.get('/getCookies', userController.showCookies);

// clearing all cookies that currently exist
router.get('/clearCookies', userController.clearCookies);

// Get school majors
router.get('/majors', userController.getMajor);

// Get school minors
router.get('/minors', userController.getMinor);

// Get all users
router.get('/allUsers', userController.getAllUsers);

// Get a full profile data for a specific user id
router.get('/profile/:id', userController.getUserById);

// search for a user
router.get('/search', userController.searchUsers);



module.exports = router;