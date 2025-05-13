const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    getRecordsSummaryByPeriod,
    getUserRecords,
    modifyRecord,
    getAllUsers,
    getCorrectionRequests,
    getCorrectionRequestsCount,
    approveCorrectionRequest,
    rejectCorrectionRequest
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Get records summary by period
router.get('/records/summary', getRecordsSummaryByPeriod);

// Get all users
router.get('/users', getAllUsers);

// Get specific user's records
router.get('/users/:user_id/records', getUserRecords);

// Modify record
router.put('/records/:id', modifyRecord);

// Correction requests routes
router.get('/correction-requests', getCorrectionRequests);
router.get('/correction-requests/count', getCorrectionRequestsCount);
router.put('/correction-requests/:id/approve', approveCorrectionRequest);
router.put('/correction-requests/:id/reject', rejectCorrectionRequest);

module.exports = router;