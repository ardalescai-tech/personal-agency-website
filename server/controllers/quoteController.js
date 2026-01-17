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
  const safePages = Array.isArray(pages) ? pages : [];
  const safeFeatures = Array.isArray(features) ? features : [];
  const safeBusinessType = business_type || '';
  const safeWebsiteType = website_type || '';
  const safeDesignPreferences = design_preferences || '';
  const safeBudgetRange = budget_range || '';
  const safeDeadline = deadline || '';
  const safeMessage = message || '';

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
        safeBusinessType,
        safeWebsiteType,
        JSON.stringify(safePages),
        JSON.stringify(safeFeatures),
        safeDesignPreferences,
        safeBudgetRange,
        safeDeadline,
        safeMessage,
        createdAt,
      ]
    );

    const emailText = [
      'Cerere oferta noua',
      `Nume: ${name}`,
      `Email: ${email}`,
      `Tip business: ${safeBusinessType || '-'}`,
      `Tip website: ${safeWebsiteType || '-'}`,
      `Pagini: ${safePages.length ? safePages.join(', ') : '-'}`,
      `Functionalitati: ${safeFeatures.length ? safeFeatures.join(', ') : '-'}`,
      `Preferinte design: ${safeDesignPreferences || '-'}`,
      `Buget: ${safeBudgetRange || '-'}`,
      `Deadline: ${safeDeadline || '-'}`,
      `Detalii: ${safeMessage || '-'}`,
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

