const { body, validationResult } = require('express-validator');

const quoteValidation = [
  body('name').trim().escape().isLength({ min: 2, max: 120 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('business_type').trim().escape().isLength({ min: 2, max: 120 }),
  body('website_type').trim().escape().isLength({ min: 2, max: 120 }),
  body('pages').isArray({ min: 1 }),
  body('pages.*').trim().escape().isLength({ min: 1, max: 120 }),
  body('features').isArray(),
  body('features.*').trim().escape().isLength({ min: 1, max: 120 }),
  body('design_preferences').trim().escape().isLength({ min: 2, max: 200 }),
  body('budget_range').trim().escape().isLength({ min: 2, max: 120 }),
  body('deadline').trim().escape().isLength({ min: 2, max: 120 }),
  body('message').trim().escape().isLength({ min: 10, max: 2000 }),
];

const contactValidation = [
  body('name').trim().escape().isLength({ min: 2, max: 120 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('message').trim().escape().isLength({ min: 10, max: 2000 }),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  return next();
};

module.exports = { quoteValidation, contactValidation, handleValidation };

