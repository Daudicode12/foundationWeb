const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const sermonController = require('../controllers/sermonController');
const adminAuth = require('../middleware/adminAuth');

// Dashboard stats (protected)
router.get('/stats', adminAuth, adminController.getDashboardStats);

// Count endpoints for dashboard
router.get('/events/count', adminAuth, adminController.countEvents);
router.get('/announcements/count', adminAuth, adminController.countAnnouncements);
router.get('/members/count', adminAuth, adminController.countMembers);
router.get('/rsvps/count', adminAuth, adminController.countRSVPs);

// Events management routes (all protected)
router.get('/events', adminAuth, adminController.listEvents);
router.post('/events', adminAuth, adminController.createEvent);
router.get('/events/:id', adminAuth, adminController.getEvent);
router.put('/events/:id', adminAuth, adminController.updateEvent);
router.delete('/events/:id', adminAuth, adminController.deleteEvent);

// Announcements management routes (all protected)
router.get('/announcements', adminAuth, adminController.listAnnouncements);
router.post('/announcements', adminAuth, adminController.createAnnouncement);
router.get('/announcements/:id', adminAuth, adminController.getAnnouncement);
router.put('/announcements/:id', adminAuth, adminController.updateAnnouncement);
router.delete('/announcements/:id', adminAuth, adminController.deleteAnnouncement);

// Sermons management routes (all protected)
router.get('/sermons', adminAuth, sermonController.listSermons);
router.get('/sermons/upcoming', adminAuth, sermonController.getUpcomingSermons);
router.post('/sermons', adminAuth, sermonController.createSermon);
router.get('/sermons/:id', adminAuth, sermonController.getSermon);
router.put('/sermons/:id', adminAuth, sermonController.updateSermon);
router.delete('/sermons/:id', adminAuth, sermonController.deleteSermon);
router.get('/sermons/day-type/:dayType', adminAuth, sermonController.getSermonsByDayType);

// RSVPs and Members routes (all protected)
router.get('/rsvps', adminAuth, adminController.listRSVPs);
router.get('/members', adminAuth, adminController.listMembers);

module.exports = router;
