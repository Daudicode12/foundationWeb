const express = require('express');
const router = express.Router();
const publicOfferingsController = require('../controllers/publicOfferingsController');

// Create a new offering (member submission)
router.post('/', publicOfferingsController.createOffering);

// Get my offerings (by email query param)
router.get('/', publicOfferingsController.getMyOfferings);

// Get my offerings by phone
router.get('/by-phone', publicOfferingsController.getMyOfferingsByPhone);

// Get my total offerings
router.get('/total', publicOfferingsController.getMyOfferingsTotal);

// Get my offerings summary by type
router.get('/summary', publicOfferingsController.getMyOfferingsSummary);

module.exports = router;
