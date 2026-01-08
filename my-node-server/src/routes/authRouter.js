const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-token', authController.verifyToken);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
