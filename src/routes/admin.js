const express = require('express');
const router = express.Router();

// Import separate admin controllers
const adminDashboardController = require('../controllers/adminDashboardController');
const adminEventsController = require('../controllers/adminEventsController');
const adminAnnouncementsController = require('../controllers/adminAnnouncementsController');
const adminMembersController = require('../controllers/adminMembersController');
const adminRsvpsController = require('../controllers/adminRsvpsController');
const adminOfferingsController = require('../controllers/adminOfferingsController');
const sermonController = require('../controllers/sermonController');
const contactController = require('../controllers/contactController');
const prayerController = require('../controllers/prayerController');
const resourceController = require('../controllers/resourceController');
const adminAuth = require('../middleware/adminAuth');

// Dashboard stats (protected)
router.get('/stats', adminAuth, adminDashboardController.getDashboardStats);

// Count endpoints for dashboard
router.get('/events/count', adminAuth, adminEventsController.countEvents);
router.get('/announcements/count', adminAuth, adminAnnouncementsController.countAnnouncements);
router.get('/members/count', adminAuth, adminMembersController.countMembers);
router.get('/rsvps/count', adminAuth, adminRsvpsController.countRSVPs);
router.get('/contacts/count', adminAuth, contactController.countUnread);
router.get('/prayer-requests/count', adminAuth, prayerController.countUnread);

// Events management routes (all protected)
router.get('/events', adminAuth, adminEventsController.listEvents);
router.post('/events', adminAuth, adminEventsController.createEvent);
router.get('/events/:id', adminAuth, adminEventsController.getEvent);
router.put('/events/:id', adminAuth, adminEventsController.updateEvent);
router.delete('/events/:id', adminAuth, adminEventsController.deleteEvent);

// Announcements management routes (all protected)
router.get('/announcements', adminAuth, adminAnnouncementsController.listAnnouncements);
router.post('/announcements', adminAuth, adminAnnouncementsController.createAnnouncement);
router.get('/announcements/:id', adminAuth, adminAnnouncementsController.getAnnouncement);
router.put('/announcements/:id', adminAuth, adminAnnouncementsController.updateAnnouncement);
router.delete('/announcements/:id', adminAuth, adminAnnouncementsController.deleteAnnouncement);

// Sermons management routes (all protected)
router.get('/sermons', adminAuth, sermonController.listSermons);
router.get('/sermons/upcoming', adminAuth, sermonController.getUpcomingSermons);
router.post('/sermons', adminAuth, sermonController.createSermon);
router.get('/sermons/:id', adminAuth, sermonController.getSermon);
router.put('/sermons/:id', adminAuth, sermonController.updateSermon);
router.delete('/sermons/:id', adminAuth, sermonController.deleteSermon);
router.get('/sermons/day-type/:dayType', adminAuth, sermonController.getSermonsByDayType);

// RSVPs routes (all protected)
router.get('/rsvps', adminAuth, adminRsvpsController.listRSVPs);
router.get('/rsvps/event/:eventId', adminAuth, adminRsvpsController.getEventRSVPs);

// Members management routes (all protected)
router.get('/members', adminAuth, adminMembersController.listMembers);
router.get('/members/:id', adminAuth, adminMembersController.getMember);
router.put('/members/:id/role', adminAuth, adminMembersController.updateMemberRole);
router.delete('/members/:id', adminAuth, adminMembersController.deleteMember);

// Contact messages management routes (all protected)
router.get('/contacts', adminAuth, contactController.listContacts);
router.get('/contacts/:id', adminAuth, contactController.getContact);
router.put('/contacts/:id/read', adminAuth, contactController.markAsRead);
router.delete('/contacts/:id', adminAuth, contactController.deleteContact);

// Prayer requests management routes (all protected)
router.get('/prayer-requests', adminAuth, prayerController.listPrayerRequests);
router.get('/prayer-requests/:id', adminAuth, prayerController.getPrayerRequest);
router.put('/prayer-requests/:id/read', adminAuth, prayerController.markAsRead);
router.put('/prayer-requests/:id/status', adminAuth, prayerController.updateStatus);
router.delete('/prayer-requests/:id', adminAuth, prayerController.deletePrayerRequest);

// Offerings management routes (all protected)
router.get('/offerings', adminAuth, adminOfferingsController.listOfferings);
router.get('/offerings/count', adminAuth, adminOfferingsController.countOfferings);
router.get('/offerings/total', adminAuth, adminOfferingsController.getTotalAmount);
router.get('/offerings/summary', adminAuth, adminOfferingsController.getOfferingsSummary);
router.get('/offerings/report/:year/:month', adminAuth, adminOfferingsController.getMonthlyReport);
router.get('/offerings/date-range', adminAuth, adminOfferingsController.getOfferingsByDateRange);
router.post('/offerings', adminAuth, adminOfferingsController.createOffering);
router.get('/offerings/:id', adminAuth, adminOfferingsController.getOffering);
router.put('/offerings/:id', adminAuth, adminOfferingsController.updateOffering);
router.delete('/offerings/:id', adminAuth, adminOfferingsController.deleteOffering);

// Resources management routes (all protected)
router.get('/resources', adminAuth, resourceController.listResources);
router.get('/resources/count', adminAuth, resourceController.countResources);
router.post('/resources', adminAuth, resourceController.createResource);
router.get('/resources/:id', adminAuth, resourceController.getResource);
router.put('/resources/:id', adminAuth, resourceController.updateResource);
router.put('/resources/:id/toggle-featured', adminAuth, resourceController.toggleFeatured);
router.delete('/resources/:id', adminAuth, resourceController.deleteResource);

module.exports = router;
