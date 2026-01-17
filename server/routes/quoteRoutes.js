const express = require('express');
const { createLead } = require('../controllers/quoteController');
const { quoteValidation, handleValidation } = require('../utils/validators');

const router = express.Router();

router.post('/', quoteValidation, handleValidation, createLead);

module.exports = router;

