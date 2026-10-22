const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole, requireCommunityScope } = require('../middleware/rbac');

const authCtrl = require('../controllers/authController');
const commCtrl = require('../controllers/communityController');
const flatCtrl = require('../controllers/flatController');
const tenancyCtrl = require('../controllers/tenancyController');
const invoiceCtrl = require('../controllers/invoiceController');
const complaintCtrl = require('../controllers/complaintController');
const visitorCtrl = require('../controllers/visitorController');
const facilityCtrl = require('../controllers/facilityController');
const parkingCtrl = require('../controllers/parkingController');
const noticeCtrl = require('../controllers/noticeController');
const analyticsCtrl = require('../controllers/analyticsController');
const superAdminCtrl = require('../controllers/superAdminController');

// -------------------------------------------------------------
// Public & Authentication Routes
// -------------------------------------------------------------
router.post('/auth/login', authCtrl.login);
router.post('/auth/demo-login', authCtrl.demoLogin);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', authenticate, authCtrl.me);
router.post('/auth/switch-community', authenticate, authCtrl.switchCommunity);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Nexora Core API Server',
    database: 'SQLite (dev.db)',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Protected Routes
// -------------------------------------------------------------
router.use(authenticate);

// Communities
router.get('/communities', commCtrl.getCommunities);
router.post('/communities', requireRole(['SUPER_ADMIN']), commCtrl.createCommunity);

// Flats & Units
router.get('/flats', flatCtrl.getFlats);

// Rental & Tenancy Management
router.get('/tenancies', tenancyCtrl.getTenancies);
router.post('/tenancies', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'RESIDENT']), tenancyCtrl.createTenancy);
router.post('/tenancies/:id/move-out', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'RESIDENT']), tenancyCtrl.moveOutSettlement);

// Dual-Ledger Invoices & Payments
router.get('/invoices', invoiceCtrl.getInvoices);
router.post('/invoices/:id/report-payment', invoiceCtrl.reportPayment);
router.post('/invoices/payments/:paymentId/verify', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN']), invoiceCtrl.verifyPayment);

// Complaints & Service Requests
router.get('/complaints', complaintCtrl.getComplaints);
router.post('/complaints', complaintCtrl.createComplaint);
router.patch('/complaints/:id/status', complaintCtrl.updateStatus);
router.post('/complaints/:id/assign', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN']), complaintCtrl.assignWorker);

// Gate Security & Visitors
router.get('/visitors', visitorCtrl.getVisitors);
router.post('/visitors', visitorCtrl.createPass);
router.post('/visitors/validate', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECURITY']), visitorCtrl.validatePass);

// Facilities
router.get('/facilities', facilityCtrl.getFacilities);
router.post('/facilities/:facilityId/book', facilityCtrl.bookFacility);

// Parking & Notices
router.get('/parking', parkingCtrl.getParkingSlots);
router.get('/notices', noticeCtrl.getNotices);
router.post('/notices', requireRole(['SUPER_ADMIN', 'ASSOCIATION_ADMIN']), noticeCtrl.publishNotice);

// Operational Analytics
router.get('/analytics', analyticsCtrl.getAnalytics);

// Nexora Super Admin Platform Oversight (Strictly Super Admin only)
router.get('/super-admin/overview', requireRole(['SUPER_ADMIN']), superAdminCtrl.getOverview);
router.get('/super-admin/communities', requireRole(['SUPER_ADMIN']), superAdminCtrl.getCommunities);
router.patch('/super-admin/communities/:id/status', requireRole(['SUPER_ADMIN']), superAdminCtrl.toggleCommunityStatus);
router.get('/super-admin/audit-logs', requireRole(['SUPER_ADMIN']), superAdminCtrl.getAuditLogs);

module.exports = router;
