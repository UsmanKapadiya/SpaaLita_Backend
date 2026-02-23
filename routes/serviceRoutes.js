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


// Add service
router.post('/', authenticateToken, addService);
// Update service
router.put('/:id',authenticateToken, updateService);
// Delete service
router.delete('/:id', authenticateToken,  deleteService);
// Get all services (public)
router.get('/', getServices);
// Get single service
router.get('/:id', getService);

module.exports = router;
