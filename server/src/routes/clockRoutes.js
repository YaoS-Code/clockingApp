const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    clockIn,
    clockOut,
    getRecords,
    getLocationSummary,
    requestCorrection,
    getUserCorrectionRequests
} = require('../controllers/clockController');

router.use(auth);

router.post('/in', clockIn);
router.post('/out', clockOut);
router.get('/records', getRecords);
router.get('/location-summary', getLocationSummary);

// 修改请求相关路由
router.post('/records/:id/correction', requestCorrection);
router.get('/correction-requests', getUserCorrectionRequests);

// Add endpoint to get allowed locations
router.get('/locations', (req, res) => {
    const { ALLOWED_LOCATIONS } = require('../config/constants');
    res.json(ALLOWED_LOCATIONS);
});

module.exports = router;