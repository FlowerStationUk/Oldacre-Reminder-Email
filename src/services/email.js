import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { getReminderHtml } from '../templates/reminderTemplate.js';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendReminderEmail = async (toEmail, orderData) => {
    try {
        const htmlContent = getReminderHtml(orderData);
        const msg = {
            to: toEmail,
            cc: 'accounts@oldacre.co.uk, khawajatn1@gmail.com',
            from: 'info@oldacre.co.uk',
            subject: `Payment Reminder: Order ${orderData.name}`,
            html: htmlContent,
        };
        await sgMail.send(msg);
        console.log(`📧 Email sent to ${toEmail} for Order ${orderData.name}`);
        return true;
    } catch (error) {
        console.error(`❌ Email Failed for ${toEmail}:`, error.response?.body || error.message);
        return false;
    }
};