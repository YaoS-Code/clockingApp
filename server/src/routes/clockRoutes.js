const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    clockIn,
    clockOut,
    getRecords,
    getLocationSummary
} = require('../controllers/clockController');

router.use(auth);

router.post('/in', clockIn);
router.post('/out', clockOut);
router.get('/records', getRecords);
router.get('/location-summary', getLocationSummary);

// Add endpoint to get allowed locations
router.get('/locations', (req, res) => {
    res.json(ALLOWED_LOCATIONS);
});

module.exports = router;