const nodemailer = require('nodemailer');

const requiredEnv = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'OWNER_EMAIL'];

const hasEmailConfig = () => requiredEnv.every((key) => process.env[key]);

const createTransporter = () => {
  if (!hasEmailConfig()) {
    return null;
  }

  const port = Number(process.env.EMAIL_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOwnerEmail = async ({ subject, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return { skipped: true, reason: 'Missing SMTP configuration.' };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.OWNER_EMAIL,
    subject,
    text,
  });

  return { skipped: false, messageId: info.messageId };
};

module.exports = { sendOwnerEmail, hasEmailConfig };

