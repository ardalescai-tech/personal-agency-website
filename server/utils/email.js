const nodemailer = require('nodemailer');

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'OWNER_EMAIL'];

const hasEmailConfig = () => requiredEnv.every((key) => process.env[key]);

const createTransporter = () => {
  if (!hasEmailConfig()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOwnerEmail = async ({ subject, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return { skipped: true, reason: 'Missing SMTP configuration.' };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.OWNER_EMAIL,
    subject,
    text,
  });

  return { skipped: false, messageId: info.messageId };
};

module.exports = { sendOwnerEmail, hasEmailConfig };

