const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// Contact form submission
router.post('/', createContact);

module.exports = router;
