const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/publicEventsController');

// Public events routes
router.get('/', eventsController.getAllEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/past', eventsController.getPastEvents);
router.get('/:id', eventsController.getEventById);
router.post('/rsvp', eventsController.rsvpEvent);
router.delete('/rsvp', eventsController.cancelRsvp);

module.exports = router;
