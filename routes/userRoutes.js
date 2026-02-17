const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
} = require('../controllers/userController');

// Apply token authentication to all user routes
router.use(authenticateToken);

// Add user
router.post('/', addUser);
// Update user
router.put('/:id', updateUser);
// Delete user
router.delete('/:id', deleteUser);
// Get all users
router.get('/', getUsers);
// Get single user
router.get('/:id', getUser);

module.exports = router;
