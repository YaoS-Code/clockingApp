const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/reminderController');

// Single appointment reminder
router.post('/appointments/:appointmentId/remind', ReminderController.sendManualReminder);

// Tomorrow's appointments
router.get('/appointments/tomorrow', ReminderController.getTomorrowAppointments);
router.post('/appointments/tomorrow/remind-all', ReminderController.sendTomorrowReminders);

module.exports = router;