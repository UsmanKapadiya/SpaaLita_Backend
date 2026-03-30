const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const {
  getDashboardStats 
} = require('../controllers/dashBordController');


// Get DashBordStats
router.get('/', authenticateToken, getDashboardStats);

module.exports = router;
