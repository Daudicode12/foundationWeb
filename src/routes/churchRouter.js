const express = require('express');
const router = express.Router();

const churchController = require('../controllers/churchController');
const superAdminController = require('../controllers/superAdmin.controller');
const superAdminAuth = require('../middleware/superAdminAuth');
const adminAuth = require('../middleware/adminAuth');

// ============================================
// SUPER ADMIN ONLY ROUTES
// ============================================

// Dashboard stats for super admin
router.get('/stats', superAdminAuth, churchController.getSuperAdminStats);

// Admin approval management (Super Admin only)
router.get('/admins', superAdminAuth, superAdminController.listAdmins);
router.get('/admins/pending', superAdminAuth, superAdminController.listPendingAdmins);
router.get('/admins/pending/count', superAdminAuth, superAdminController.countPendingAdmins);
router.put('/admins/:id/approve', superAdminAuth, superAdminController.approveAdmin);
router.put('/admins/:id/reject', superAdminAuth, superAdminController.rejectAdmin);
router.put('/admins/:id/revoke', superAdminAuth, superAdminController.revokeAdmin);

// Church management (Super Admin only)
router.get('/churches', superAdminAuth, churchController.listChurches);
router.post('/churches', superAdminAuth, churchController.createChurch);
router.get('/churches/:id', superAdminAuth, churchController.getChurch);
router.put('/churches/:id', superAdminAuth, churchController.updateChurch);
router.delete('/churches/:id', superAdminAuth, churchController.deleteChurch);

// Contribution targets (Super Admin only)
router.post('/targets', superAdminAuth, churchController.setContributionTarget);
router.get('/targets/year/:year', superAdminAuth, churchController.getTargetsByYear);
router.get('/targets/church/:churchId/year/:year', superAdminAuth, churchController.getChurchTarget);
router.delete('/targets/:id', superAdminAuth, churchController.deleteTarget);

// Progress monitoring (Super Admin only)
router.get('/progress/:year', superAdminAuth, churchController.getContributionProgress);
router.get('/progress/church/:churchId/year/:year', superAdminAuth, churchController.getChurchProgress);

// ============================================
// ADMIN ROUTES (accessible by both admin and super_admin)
// ============================================

// List active churches (for dropdowns, etc.)
router.get('/active-churches', adminAuth, churchController.listActiveChurches);
router.get('/churches/count', adminAuth, churchController.countChurches);

// Contributions management
router.get('/contributions', adminAuth, churchController.listContributions);
router.post('/contributions', adminAuth, churchController.recordContribution);
router.get('/contributions/:id', adminAuth, churchController.getContribution);
router.put('/contributions/:id', adminAuth, churchController.updateContribution);
router.delete('/contributions/:id', adminAuth, churchController.deleteContribution);

module.exports = router;
