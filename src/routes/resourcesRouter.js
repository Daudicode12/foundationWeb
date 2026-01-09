const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Public routes for members to view resources
router.get('/', resourceController.getPublicResources);
router.get('/:id', resourceController.getPublicResource);

module.exports = router;
