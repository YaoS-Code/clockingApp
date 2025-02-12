const EmailService = require('../services/emailService');
const Appointment = require('../models/appointmentModel');
const logger = require('../utils/logger');

class ReminderController {
  static async sendManualReminder(req, res) {
    try {
      const { appointmentId } = req.params;
      logger.debug('Sending manual reminder', { appointmentId });

      const appointments = await Appointment.getUpcomingAppointments(appointmentId);
      
      if (!appointments || appointments.length === 0) {
        logger.warn('Appointment not found', { appointmentId });
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const appointment = appointments[0];
      logger.debug('Found appointment', { appointment });

      const sent = await EmailService.sendAppointmentReminder(appointment);
      if (sent) {
        await Appointment.updateReminderStatus(appointmentId, true);
        logger.info('Reminder sent successfully', { appointmentId });
        res.json({ message: 'Reminder sent successfully' });
      } else {
        logger.error('Failed to send reminder', { appointmentId });
        res.status(500).json({ message: 'Failed to send reminder' });
      }
    } catch (error) {
      logger.error('Error in sendManualReminder', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async getTomorrowAppointments(req, res) {
    try {
      const appointments = await Appointment.getTomorrowAppointments();
      res.json({
        count: appointments.length,
        appointments: appointments
      });
    } catch (error) {
      logger.error('Error fetching tomorrow appointments', error);
      res.status(500).json({ message: error.message });
    }
  }

  static async sendTomorrowReminders(req, res) {
    try {
      const appointments = await Appointment.getTomorrowAppointments();
      
      if (!appointments || appointments.length === 0) {
        return res.json({ 
          message: 'No appointments found for tomorrow',
          count: 0 
        });
      }

      const results = [];
      for (const appointment of appointments) {
        try {
          const sent = await EmailService.sendAppointmentReminder(appointment);
          if (sent) {
            await Appointment.updateReminderStatus(appointment.appointment_no, true);
            results.push({
              appointment_no: appointment.appointment_no,
              status: 'success'
            });
          } else {
            results.push({
              appointment_no: appointment.appointment_no,
              status: 'failed'
            });
          }
        } catch (error) {
          results.push({
            appointment_no: appointment.appointment_no,
            status: 'error',
            message: error.message
          });
        }
      }

      res.json({
        message: 'Completed sending reminders',
        total: appointments.length,
        results: results
      });

    } catch (error) {
      logger.error('Error sending tomorrow reminders', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ReminderController;