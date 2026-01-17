const express = require('express');
const { createContact } = require('../controllers/contactController');
const { contactValidation, handleValidation } = require('../utils/validators');

const router = express.Router();

router.post('/', contactValidation, handleValidation, createContact);

module.exports = router;

