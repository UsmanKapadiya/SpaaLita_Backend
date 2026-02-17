const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addRole,
  updateRole,
  deleteRole,
  getRoles,
  getRole,
} = require('../controllers/roleController');

// Apply token authentication to all role routes
router.use(authenticateToken);

// Add role
router.post('/', addRole);
// Update role
router.put('/:id', updateRole);
// Delete role
router.delete('/:id', deleteRole);
// Get all roles
router.get('/', getRoles);
// Get single role
router.get('/:id', getRole);

module.exports = router;
