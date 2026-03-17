const express = require('express');
const router = express.Router();
const createUpload = require('../middleware/upload');
const uploadCategory = createUpload('category');
const authenticateToken = require('../middleware/authenticateToken');

const {
  addCategory,
  updateCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory
} = require('../controllers/categoryController');

router.post('/', authenticateToken, uploadCategory.single('image'), addCategory); 
router.put('/:id', authenticateToken, uploadCategory.single('image'), updateCategory);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById); 

router.delete('/:id', authenticateToken, deleteCategory);

module.exports = router;