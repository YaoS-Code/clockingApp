const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const TemplateService = require('./templateService');
const path = require('path');

class EmailService {
  static getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      logger.debug('Email transporter created', { 
        host: process.env.SMTP_HOST, 
        port: process.env.SMTP_PORT 
      });
    }
    return this.transporter;
  }

  static async sendAppointmentReminder(appointment) {
    try {
      if (!appointment.email) {
        logger.warn('No email address provided for appointment');
        return false;
      }

      const template = TemplateService.getEmailTemplate(appointment.provider_name, appointment);
      const transporter = this.getTransporter();

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: appointment.email,
        cc: process.env.SMTP_CC,
        subject: template.subject,
        html: template.html,
        attachments: template.attachments
      };

      logger.debug('Sending email', { 
        to: appointment.email, 
        subject: template.subject 
      });

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        messageId: info.messageId,
        to: appointment.email 
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email', error);
      return false;
    }
  }

  static async verifyConnection() {
    try {
      await this.getTransporter().verify();
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed:', error);
      return false;
    }
  }
}

module.exports = EmailService;