const EmailService = require('../services/emailService');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function testEmailConfig() {
    try {
        logger.info('Testing email configuration...');

        const transporter = EmailService.getTransporter();
        await transporter.verify();
        logger.info('SMTP connection successful');

        const testResult = await EmailService.sendAppointmentReminder({
            client_name: 'Test User',
            email: 'yao.s.1216@gmail.com',
            provider_name: 'Test Provider',
            appointment_date: new Date(),
            start_time: '09:00:00'
        });

        logger.info('Test email result:', { success: testResult });
    } catch (error) {
        logger.error('Email configuration test failed:', error);
        logger.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
    }
}

testEmailConfig();