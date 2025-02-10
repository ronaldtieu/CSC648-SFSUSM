const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');  
const searchController = require('../controllers/searchController');


router.get('/', userController.verifyToken, searchController.search);

module.exports = router;