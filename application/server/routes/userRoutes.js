const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const session = require('../config/session');
const { validateProfileEdit } = require('../middlewares/validateProfileEdit'); // Corrected path
const { authenticateToken } = require('../middlewares/auth'); // Corrected function name and path

// Route for user registration with automatic login
router.post('/register', userController.registerUser, userController.loginAfterRegistration);

// Route for user login
router.post('/login', userController.loginUser);

// Route for user logout
router.post('/logout', userController.logoutUser);

// Route to check user session status
router.get('/check-session', session.checkSession);

// Route to edit user profile
router.put(
    '/edit-profile', // Endpoint for editing profile
    authenticateToken, // Middleware to ensure the user is authenticated
    validateProfileEdit, // Middleware to validate profile edit data
    userController.editUserProfile // Controller method to handle profile editing
);

module.exports = router;