const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use your SMTP provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendInterviewEmail = async (email, name, selectDate, selectTime) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Interview Confirmation',
            text: `Hello ${name},\n\nYour interview is scheduled on ${selectDate} at ${selectTime}.\n\nThank you!`
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendInterviewEmail;