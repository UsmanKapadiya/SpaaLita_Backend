const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminLogout,
} = require('../controllers/adminController');

// Admin login
router.post('/login', adminLogin);

// Admin logout
router.post('/logout', adminLogout);

module.exports = router;
