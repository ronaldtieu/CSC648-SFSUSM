const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const session = require('../config/session');

// Route for user registration with automatic login
router.post('/register', userController.registerUser, userController.loginAfterRegistration);


// route for user login
router.post('/login', userController.loginUser);


router.post('/logout', userController.logoutUser);


router.get('/check-session', session.checkSession);


module.exports = router;