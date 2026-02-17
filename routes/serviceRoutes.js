const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addService,
  updateService,
  deleteService,
  getServices,
  getService,
} = require('../controllers/serviceController');

// Apply token authentication to all service routes
router.use(authenticateToken);

// Add service
router.post('/', addService);
// Update service
router.put('/:id', updateService);
// Delete service
router.delete('/:id', deleteService);
// Get all services
router.get('/', getServices);
// Get single service
router.get('/:id', getService);

module.exports = router;
