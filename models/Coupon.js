const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  allowFreeShipping: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxOrderAmount: { type: Number, default: null },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'productsModel'
  }],
  productsModel: [{ type: String, enum: ['Product', 'GiftCard'] }], // dynamic ref
  excludeProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'excludeProductsModel'
  }],
  excludeProductsModel: [{ type: String, enum: ['Product', 'GiftCard'] }],
  categories: [{ type: String }],
  excludeCategories: [{ type: String }],
  usageLimitPerCoupon: { type: Number, default: null },
  usageLimitPerUser: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
