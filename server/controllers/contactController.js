const { run } = require('../db/sqlite');
const { sendOwnerEmail } = require('../utils/email');

const createContact = async (req, res) => {
  const { name, email, message } = req.body;
  const createdAt = new Date().toISOString();

  try {
    const result = await run(
      `INSERT INTO contacts (
        name,
        email,
        message,
        created_at
      ) VALUES (?, ?, ?, ?)` ,
      [name, email, message, createdAt]
    );

    const emailText = [
      'Mesaj nou din contact',
      `Nume: ${name}`,
      `Email: ${email}`,
      `Mesaj: ${message}`,
      `ID contact: ${result.id}`,
    ].join('\n');

    await sendOwnerEmail({
      subject: `Mesaj contact - ${name}`,
      text: emailText,
    });

    return res.status(201).json({ ok: true, id: result.id });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Eroare la salvare.' });
  }
};

module.exports = { createContact };

