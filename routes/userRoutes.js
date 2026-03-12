const express = require('express');
const router = express.Router();
const createUpload = require('../middleware/upload');
const authenticateToken = require('../middleware/authenticateToken');
const uploadUserProfile = createUpload('userProfile');

const {
  addUser,
  updateUser,
  updateUserAddresses,
  deleteUser,
  getUsers,
  getUser,
  loginUser,
  logoutUser,
} = require('../controllers/userController');


// Public routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Apply token authentication to all user routes below
router.use(authenticateToken);

// Add user
// router.post('/', addUser);

router.post('/', uploadUserProfile.single('profilePicture'), addUser);

// Update user
router.put('/:id', uploadUserProfile.single('profilePicture'), updateUser);
router.put('/:id/addresses', updateUserAddresses);
// Delete user
router.delete('/:id', deleteUser);
// Get all users
router.get('/', getUsers);
// Get single user
router.get('/:id', getUser);

module.exports = router;
