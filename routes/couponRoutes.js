const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  addCoupon,
  updateCoupon,
  getCouponById,
  getAllCoupons,
  deleteCoupon,
  applyCoupon
} = require('../controllers/couponController');

// Apply token authentication to protected product routes only
router.post('/', authenticateToken, addCoupon);
router.put('/:id', authenticateToken, updateCoupon);
router.get('/:id', authenticateToken, getCouponById);
router.get('/', authenticateToken, getAllCoupons);
router.delete('/:id', authenticateToken, deleteCoupon);
router.post('/apply', applyCoupon);

module.exports = router;
