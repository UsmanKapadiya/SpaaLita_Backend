const express = require('express');
const router = express.Router();
const createUpload = require('../middleware/upload');
const uploadProduct = createUpload('products');
const authenticateToken = require('../middleware/authenticateToken');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
  applyCoupon,
} = require('../controllers/productController');

//add Products
// router.post('/', authenticateToken, upload.array('productImages', 10), addProduct);
router.post('/', authenticateToken, uploadProduct.array('productImages', 10), addProduct);

//Update Products
router.put('/:id', authenticateToken, uploadProduct.array('productImages', 10), updateProduct);

//Delete 
router.delete('/:id', authenticateToken, deleteProduct);

// Get all products (no token required)
router.get('/', getProducts);

// Get single product (no token required)
router.get('/:id', getProduct);

// Get related products (no token required)
router.get('/:id/related', getRelatedProducts);

// Apply coupon to product (no token required)
router.post('/apply-coupon', applyCoupon);

module.exports = router;
