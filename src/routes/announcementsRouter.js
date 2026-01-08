const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/publicAnnouncementsController');

// Public announcements routes
router.get('/', announcementsController.getAllAnnouncements);

module.exports = router;
