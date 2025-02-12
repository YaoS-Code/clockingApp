const cron = require('node-cron');
const Appointment = require('../models/appointmentModel');
const EmailService = require('./emailService');

class ReminderService {
  static async processReminders() {
    const daysAhead = process.env.REMINDER_DAYS_BEFORE || 1;
    const appointments = await Appointment.getUpcomingAppointments(daysAhead);

    for (const appointment of appointments) {
      const sent = await EmailService.sendAppointmentReminder(appointment);
      if (sent) {
        await Appointment.updateReminderStatus(appointment.id, true);
      }
    }
  }

  static startScheduler() {
    const scheduledHour = process.env.REMINDER_HOUR || 17;
    cron.schedule(`0 ${scheduledHour} * * *`, this.processReminders);
    console.log(`Reminder scheduler started, running daily at ${scheduledHour}:00`);
  }
}

module.exports = ReminderService;