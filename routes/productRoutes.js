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
router.use(authenticateToken);

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
