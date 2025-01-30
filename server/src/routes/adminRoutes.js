const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    getRecordsSummaryByPeriod,
    getUserRecords,
    modifyRecord,
    getAllUsers
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

module.exports = router;