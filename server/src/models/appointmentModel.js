const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Appointment {
  static async getUpcomingAppointments(appointmentId) {
    try {
      logger.debug('Fetching appointment', { appointmentId });
      
      const [rows] = await pool.promise().query(`
        SELECT 
          appointment_no,
          provider_no,
          provider_name,
          demographic_no,
          client_name,
          appointment_date,
          start_time,
          reason,
          notes,
          location,
          phone,
          email,
          reminder_sent,
          reminder_sent_at
        FROM appointments 
        WHERE appointment_no = ?
      `, [appointmentId]);

      logger.debug('Query result', { rowCount: rows.length, rows });
      return rows;
    } catch (error) {
      logger.error('Failed to fetch appointment', error);
      throw new Error(`Failed to fetch appointment: ${error.message}`);
    }
  }

  static async updateReminderStatus(appointmentId, status) {
    try {
      logger.debug('Updating reminder status', { appointmentId, status });
      
      const [result] = await pool.promise().query(`
        UPDATE appointments 
        SET reminder_sent = ?,
            reminder_sent_at = CURRENT_TIMESTAMP
        WHERE appointment_no = ?
      `, [status ? 1 : 0, appointmentId]);

      logger.debug('Update result', { affectedRows: result.affectedRows });
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Failed to update reminder status', error);
      throw new Error(`Failed to update reminder status: ${error.message}`);
    }
  }

  static async getTomorrowAppointments() {
    try {
      logger.debug('Fetching tomorrow appointments');
      
      const [rows] = await pool.promise().query(`
        SELECT 
          appointment_no,
          provider_no,
          provider_name,
          demographic_no,
          client_name,
          appointment_date,
          start_time,
          reason,
          notes,
          location,
          phone,
          email,
          reminder_sent,
          reminder_sent_at
        FROM appointments 
        WHERE appointment_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND email IS NOT NULL 
        AND email != ''
        ORDER BY start_time ASC
      `);

      logger.debug('Found tomorrow appointments', { count: rows.length });
      return rows;
    } catch (error) {
      logger.error('Failed to fetch tomorrow appointments', error);
      throw new Error(`Failed to fetch tomorrow appointments: ${error.message}`);
    }
  }
}

module.exports = Appointment;