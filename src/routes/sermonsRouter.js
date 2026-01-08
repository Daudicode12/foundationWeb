const express = require('express');
const router = express.Router();
const sermonsController = require('../controllers/publicSermonsController');

// Public sermons routes
router.get('/', sermonsController.getAllSermons);
router.get('/upcoming', sermonsController.getUpcomingSermons);
router.get('/:id', sermonsController.getSermonById);
router.get('/day-type/:dayType', sermonsController.getSermonsByDayType);

module.exports = router;
