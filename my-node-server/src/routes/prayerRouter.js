const express = require('express');
const router = express.Router();
const prayerController = require('../controllers/prayerController');

// Member prayer request routes
router.post('/', prayerController.submitPrayerRequest);
router.get('/', prayerController.getUserPrayerRequests);

module.exports = router;
