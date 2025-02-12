const SchedulerService = require('../services/schedulerService');

async function testReminders() {
  try {
    await SchedulerService.runManually();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testReminders();