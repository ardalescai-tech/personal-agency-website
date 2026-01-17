const { run } = require('../db/sqlite');
const { sendOwnerEmail } = require('../utils/email');

const createLead = async (req, res) => {
  const {
    name,
    email,
    business_type,
    website_type,
    pages,
    features,
    design_preferences,
    budget_range,
    deadline,
    message,
  } = req.body;

  const createdAt = new Date().toISOString();

  try {
    const result = await run(
      `INSERT INTO leads (
        name,
        email,
        business_type,
        website_type,
        pages,
        features,
        design_preferences,
        budget_range,
        deadline,
        message,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        name,
        email,
        business_type,
        website_type,
        JSON.stringify(pages),
        JSON.stringify(features),
        design_preferences,
        budget_range,
        deadline,
        message,
        createdAt,
      ]
    );

    const emailText = [
      'Cerere oferta noua',
      `Nume: ${name}`,
      `Email: ${email}`,
      `Tip business: ${business_type}`,
      `Tip website: ${website_type}`,
      `Pagini: ${Array.isArray(pages) ? pages.join(', ') : pages}`,
      `Functionalitati: ${Array.isArray(features) ? features.join(', ') : features}`,
      `Preferinte design: ${design_preferences}`,
      `Buget: ${budget_range}`,
      `Deadline: ${deadline}`,
      `Detalii: ${message}`,
      `ID lead: ${result.id}`,
    ].join('\n');

    await sendOwnerEmail({
      subject: `Cerere oferta noua - ${name}`,
      text: emailText,
    });

    return res.status(201).json({ ok: true, id: result.id });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Eroare la salvare.' });
  }
};

module.exports = { createLead };

