const express = require('express');
const router = express.Router();
const createUpload = require('../middleware/upload');
const uploadServices = createUpload('services');
const authenticateToken = require('../middleware/authenticateToken');
const {
  addService,
  updateService,
  deleteService,
  getServices,
  getService,
} = require('../controllers/serviceController');


// Add service
router.post('/', authenticateToken, uploadServices.single('serviceImage'), addService);
// Update service
router.put('/:id',authenticateToken, uploadServices.single('serviceImage'), updateService);
// Delete service
router.delete('/:id', authenticateToken,  deleteService);
// Get all services (public)
router.get('/', getServices);
// Get single service
router.get('/:id', getService);

module.exports = router;
