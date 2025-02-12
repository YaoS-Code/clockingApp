const cron = require('node-cron');
const ReminderController = require('../controllers/reminderController');
const logger = require('../utils/logger');

class SchedulerService {
  static initializeScheduledTasks() {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => this.sendDailyReminders(), {
      timezone: "America/Vancouver"
    });

    logger.info('Scheduler initialized');
  }

  static async sendDailyReminders() {
    logger.info('Running daily appointment reminders');
    try {
      const appointments = await ReminderController.sendTomorrowReminders({
        query: { forceSend: false }
      }, {
        json: (response) => {
          logger.info('Daily reminders completed', response);
          return response;
        },
        status: () => ({
          json: (response) => {
            logger.error('Daily reminders failed', response);
            return response;
          }
        })
      });
      return appointments;
    } catch (error) {
      logger.error('Failed to run daily reminders', error);
      throw error;
    }
  }

  static async runManually() {
    logger.info('Manually running appointment reminders');
    return this.sendDailyReminders();
  }
}

module.exports = SchedulerService;