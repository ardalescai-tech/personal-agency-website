const { body, validationResult } = require('express-validator');

const quoteValidation = [
  body('name').trim().escape().isLength({ min: 2, max: 120 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('business_type').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('website_type').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('pages').optional().isArray(),
  body('pages.*').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('features').optional().isArray(),
  body('features.*').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('design_preferences').optional({ checkFalsy: true }).trim().escape().isLength({ max: 200 }),
  body('budget_range').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('deadline').optional({ checkFalsy: true }).trim().escape().isLength({ max: 120 }),
  body('message').optional({ checkFalsy: true }).trim().escape().isLength({ max: 2000 }),
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

