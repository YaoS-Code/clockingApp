const nodemailer = require('nodemailer');

const emailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
};

const transporter = nodemailer.createTransport(emailConfig);

module.exports = transporter;