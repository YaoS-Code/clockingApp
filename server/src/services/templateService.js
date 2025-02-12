const path = require('path');
const logger = require('../utils/logger');

class TemplateService {
  static getEmailTemplate(provider, appointment) {
    const clinicInfo = {
      name: 'Midtown Medical Clinic',
      address: '130-8780 Blundell Rd, Richmond, BC, V7A 4H2',
      phone: '604-629-8968',
      fax: '604-632-4999',
      hours: 'Mon-Fri 9:00AM-5:00PM'
    };

    const confidentialityNotice = `This E-mail message and any attachments are CONFIDENTIAL and intended solely for the addressees. 
      If you are not an intended recipient, or you receive this message in error, we would be grateful that you deleted this message and informed us. 
      You are also hereby notified that this statement prohibits any unauthorized use, copying or dissemination with or without altering this E-mail, 
      in which case, a legal action in BC Canada is reserved for violation.`;

    const attachmentsPath = path.join(process.cwd(), process.env.ATTACHMENTS_PATH);

    const templates = {
      'Sun, Ken_36915': {
        subject: 'Reminder! Your Spirometry Appointment',
        html: `
          <div style='font-family: Arial, sans-serif; color: #333;'>
            <p>Hi ${appointment.client_name},</p>
            <p>Thank you for choosing us for your healthcare needs. You are scheduled for a spirometry test with Dr. Sun Ken as follows:</p>
            <ul>
              <li><strong>Clinic Name:</strong> ${clinicInfo.name}</li>
              <li><strong>Appointment Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</li>
              <li><strong>Appointment Time:</strong> ${appointment.start_time}</li>
              <li><strong>Address:</strong> ${clinicInfo.address}</li>
            </ul>
            <p>Please take note of the following important details:</p>
            <ol>
              <li>Please arrive at the clinic 10 minutes before your appointment time for registration and ID verification.</li>
              <li>Please bring your MSP card with you to the clinic.</li>
              <li>Continue to take all your non-respiratory medications prescribed by your doctor.</li>
              <li>Bring your own Oxygen device (e.g., aerochamber, if applicable).</li>
              <li>It will take 30-45 mins for this appointment.</li>
              <li>Parking is free and available at designated slots outside the clinic.</li>
              <li>Please follow up with your referring doctor or clinic for the report.</li>
              <li>Our office requires 48-hour notice for rescheduling or cancellation. Any No-Show will be charged $50.</li>
              <li>If you need to reschedule your appointment for a different test time, please email us.</li>
              <li>Please reply with 'CONFIRMED' to this email, along with your Height (cm) and Weight (kg) at least 3 business days prior to your appointment.</li>
              <li>Please carefully review the attached instructions. If you have any questions, please feel free to contact us via email.</li>
            </ol>
            <p>Warm regards,<br/>Midtown Medical Clinic Specialist Team</p>
            <p>${clinicInfo.hours}<br/>Tel: ${clinicInfo.phone}<br/>Fax: ${clinicInfo.fax}<br/>${clinicInfo.address}</p>
            <p><small>${confidentialityNotice}</small></p>
          </div>
        `,
        attachments: [{
          filename: 'Instruction-Spirometry.pdf',
          path: path.join(attachmentsPath, 'Instruction-Spirometry.pdf')
        }]
      },
      'Liu, Harry CHAOCHENG_J6097_49203': {
        subject: 'Dermatologist Appointment: Please reply with \'CONFIRMED\'',
        html: `
          <div style='font-family: Arial, sans-serif; color: #333;'>
            <p>Hi ${appointment.client_name},</p>
            <p>Thank you for letting us be involved in your dermatology care.</p>
            <p>You are scheduled for an appointment with Dr. Liu Harry CHAOCHENG for:</p>
            <ul>
              <li><strong>Clinic Name:</strong> ${clinicInfo.name}</li>
              <li><strong>Appt Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</li>
              <li><strong>Appt Time:</strong> ${appointment.start_time}</li>
              <li><strong>Address:</strong> ${clinicInfo.address}</li>
            </ul>
            <p>Please note the following information for your reference:</p>
            <ol>
              <li>We are located at ${clinicInfo.address}. There are reserve parking lots available for our clinic patients.</li>
              <li>Our office requires 48-hour notice for appointment rescheduling or cancellation. Any same-day cancellation or No-Show will be charged $75.</li>
              <li>The initial appointment will take approximately 15 minutes and please arrive 5~10 mins prior for filling out the intake form (ENG & CHN).</li>
              <li>If you do not speak English or Mandarin fluently, please make sure that you bring an interpreter.</li>
              <li>Please be advised that the Doctor could address ONE issue during each visit.</li>
              <li>Please bring your Care Card and an updated list of current medications.</li>
              <li>Please wear loose fitting clothes for easier exposure of your skin.</li>
              <li>Please reply with 'CONFIRMED' to this email at least 5 business days prior to your appointment.</li>
            </ol>
            <p>Warm regards,<br/>Midtown Medical Clinic Specialist Team</p>
            <p>${clinicInfo.hours}<br/>Tel: ${clinicInfo.phone}<br/>Fax: ${clinicInfo.fax}<br/>${clinicInfo.address}</p>
            <p><small>${confidentialityNotice}</small></p>
          </div>
        `
      },
      'Gao, YanXiang_59539': {
        subject: 'MMC Dr. Gao Appointment: Please reply with \'CONFIRMED\'',
        html: `
          <div style='font-family: Arial, sans-serif; color: #333;'>
            <p>Hi ${appointment.client_name},</p>
            <p>Thank you for letting us be involved in your Gynecological care.</p>
            <p>You are scheduled for an appointment with Dr. Gao YanXiang for:</p>
            <ul>
              <li><strong>Clinic Name:</strong> ${clinicInfo.name}</li>
              <li><strong>Appt Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</li>
              <li><strong>Appt Time:</strong> ${appointment.start_time}</li>
              <li><strong>Address:</strong> ${clinicInfo.address}</li>
            </ul>
            <p>Please note the following information for your reference:</p>
            <ol>
              <li>We are located at ${clinicInfo.address}. There are reserve parking lots available for our clinic patients.</li>
              <li>Our office requires 48-hour notice for appointment rescheduling or cancellation. Any same-day cancellation or No-Show will be charged $75.</li>
              <li>The initial appointment will take approximately 15 minutes and please arrive 5~10 mins prior for filling out the intake form (ENG & CHN).</li>
              <li>If you do not speak English or Mandarin fluently, please make sure that you bring an interpreter.</li>
              <li>Please be advised that the Doctor could address ONE issue during each visit.</li>
              <li>Please bring your Care Card and an updated list of current medications.</li>
              <li>Please reply with 'CONFIRMED' to this email, ensure you do so at least 5 business days prior to your appointment.</li>
            </ol>
            <p>Warm regards,<br/>Midtown Medical Clinic Specialist Team</p>
            <p>${clinicInfo.hours}<br/>Tel: ${clinicInfo.phone}<br/>Fax: ${clinicInfo.fax}<br/>${clinicInfo.address}</p>
            <p><small>${confidentialityNotice}</small></p>
          </div>
        `
      },
      'default': {
        subject: 'Appointment Reminder',
        html: `
          <div style='font-family: Arial, sans-serif; color: #333;'>
            <p>Hi ${appointment.client_name},</p>
            <p>This is a reminder of your upcoming appointment:</p>
            <ul>
              <li><strong>Provider:</strong> ${appointment.provider_name}</li>
              <li><strong>Date:</strong> ${appointment.appointment_date}</li>
              <li><strong>Time:</strong> ${appointment.start_time}</li>
              <li><strong>Location:</strong> ${appointment.location}</li>
            </ul>
            <p>Warm regards,<br/>Midtown Medical Clinic Specialist Team</p>
          </div>
        `
      }
    };

    return templates[appointment.provider_name] || templates.default;
  }
}

module.exports = TemplateService;