const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
} = require('../controllers/productController');

// Apply token authentication to all product routes
// Apply token authentication to protected product routes only
router.post('/', authenticateToken, addProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
// Get all products (no token required)
router.get('/', getProducts);
// Get single product (no token required)
router.get('/:id', getProduct);
// Get related products (no token required)
router.get('/:id/related', getRelatedProducts);

// Add product
router.post('/', addProduct);
// Update product
router.put('/:id', updateProduct);
// Delete product
router.delete('/:id', deleteProduct);
// Get all products
router.get('/', getProducts);
// Get single product
router.get('/:id', getProduct);
// Get related products
router.get('/:id/related', getRelatedProducts);

module.exports = router;
