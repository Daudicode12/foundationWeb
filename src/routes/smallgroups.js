const express = require('express');
const router = express.Router();
const smallGroupController = require('../controllers/smallgroupcontroller');

// Small groups routes
router.post('/create', smallGroupController.createSmallGroup);
router.post('/join', smallGroupController.joinSmallGroup);
router.post('/leave', smallGroupController.leavingSmallGroup);
router.get('/all', smallGroupController.getAllSmallGroups);
router.get('/:id', smallGroupController.getSingleSmallGroup);

module.exports = router;