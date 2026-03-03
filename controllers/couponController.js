// Make sure path is correct
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const GiftCard = require('../models/GiftCard');

const addCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      allowFreeShipping,
      expiryDate,
      minOrderAmount,
      maxOrderAmount,
      products = [],
      excludeProducts = [],
      categories = [],
      excludeCategories = [],
      usageLimitPerCoupon,
      usageLimitPerUser
    } = req.body;

    // Basic validation
    if (!code || !discountType || discountValue == null || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code, discount type, amount, and expiry date are required'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }

    // Get all Product and GiftCard IDs
    const productIds = (await Product.find({}, '_id')).map(p => p._id.toString());
    const giftCardIds = (await GiftCard.find({}, '_id')).map(g => g._id.toString());

    // Set productsModel dynamically
    const productsModel = products.map(id =>
      giftCardIds.includes(id) ? 'GiftCard' : 'Product'
    );

    const excludeProductsModel = excludeProducts.map(id =>
      giftCardIds.includes(id) ? 'GiftCard' : 'Product'
    );

    // Create coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      allowFreeShipping: !!allowFreeShipping,
      expiryDate: new Date(expiryDate),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxOrderAmount: maxOrderAmount ? Number(maxOrderAmount) : null,
      products,
      productsModel,
      excludeProducts,
      excludeProductsModel,
      categories,
      excludeCategories,
      usageLimitPerCoupon: usageLimitPerCoupon ? Number(usageLimitPerCoupon) : null,
      usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : null,
      status: 'active'
    });

    await coupon.save();

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating coupon', error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params; // Coupon ID
    const {
      code,
      discountType,
      discountValue,
      allowFreeShipping,
      expiryDate,
      minOrderAmount,
      maxOrderAmount,
      products = [],
      excludeProducts = [],
      categories = [],
      excludeCategories = [],
      usageLimitPerCoupon,
      usageLimitPerUser,
      status
    } = req.body;

    // Validation
    if (!code || !discountType || discountValue == null || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code, discount type, amount, and expiry date are required'
      });
    }

    // Find existing coupon
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check for code conflicts
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
    if (existingCoupon) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }

    // Get all Product and GiftCard IDs
    const productIds = (await Product.find({}, '_id')).map(p => p._id.toString());
    const giftCardIds = (await GiftCard.find({}, '_id')).map(g => g._id.toString());

    // Set productsModel dynamically
    const productsModel = products.map(id => giftCardIds.includes(id) ? 'GiftCard' : 'Product');
    const excludeProductsModel = excludeProducts.map(id => giftCardIds.includes(id) ? 'GiftCard' : 'Product');

    // Update fields
    coupon.code = code.toUpperCase();
    coupon.discountType = discountType;
    coupon.discountValue = Number(discountValue);
    coupon.allowFreeShipping = !!allowFreeShipping;
    coupon.expiryDate = new Date(expiryDate);
    coupon.minOrderAmount = minOrderAmount ? Number(minOrderAmount) : 0;
    coupon.maxOrderAmount = maxOrderAmount ? Number(maxOrderAmount) : null;
    coupon.products = products;
    coupon.productsModel = productsModel;
    coupon.excludeProducts = excludeProducts;
    coupon.excludeProductsModel = excludeProductsModel;
    coupon.categories = categories;
    coupon.excludeCategories = excludeCategories;
    coupon.usageLimitPerCoupon = usageLimitPerCoupon ? Number(usageLimitPerCoupon) : null;
    coupon.usageLimitPerUser = usageLimitPerUser ? Number(usageLimitPerUser) : null;
    if (status) coupon.status = status;

    await coupon.save();

    res.status(200).json({ success: true, message: 'Coupon updated successfully', data: coupon });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating coupon', error: error.message });
  }
};

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Find coupon by ID and populate products & excludeProducts
        const coupon = await Coupon.findById(id)
            .populate('products', 'productName _id')        // Only return productName and _id
            .populate('excludeProducts', 'productName _id');

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Coupon fetched successfully',
            data: coupon
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon',
            error: error.message
        });
    }
};

const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } }
        // You can also add search by product name later
      ];
    }

    const total = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      // Populate dynamic refs for products
      .populate({ path: 'products', select: 'productName _id', model: null }) // Mongoose will use refPath
      .populate({ path: 'excludeProducts', select: 'productName _id', model: null });

    res.status(200).json({
      success: true,
      message: 'Coupons fetched successfully',
      data: coupons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, cartItems, shippingAmount = 0 } = req.body;
    // cartItems = [{ productId, price, qty, category }] 

    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' })
      .populate('products', 'productName _id')
      .populate('excludeProducts', 'productName _id');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or inactive' });
    }

    const now = new Date();
    if (coupon.expiryDate < now) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usageLimitPerCoupon && coupon.usageCount >= coupon.usageLimitPerCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Calculate total cart amount
    let cartTotal = 0;
    let eligibleAmount = 0;

    for (let item of cartItems) {
      const productIncluded =
        coupon.products.length === 0 || coupon.products.some(p => p._id.toString() === item.productId);
      const productExcluded =
        coupon.excludeProducts.length > 0 && coupon.excludeProducts.some(p => p._id.toString() === item.productId);
      const categoryExcluded = coupon.excludeCategories.includes(item.category || '');
      const categoryIncluded = coupon.categories.length === 0 || coupon.categories.includes(item.category || '');

      cartTotal += item.price * item.qty;

      if (productIncluded && !productExcluded && categoryIncluded && !categoryExcluded) {
        eligibleAmount += item.price * item.qty;
      }
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}` });
    }

    if (coupon.maxOrderAmount && cartTotal > coupon.maxOrderAmount) {
      return res.status(400).json({ success: false, message: `Maximum order amount for this coupon is ${coupon.maxOrderAmount}` });
    }

    if (eligibleAmount === 0) {
      return res.status(400).json({ success: false, message: 'No eligible products in cart for this coupon' });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, eligibleAmount);
    } else if (coupon.discountType === 'percentage') {
      discount = (eligibleAmount * coupon.discountValue) / 100;
    }

    // Optional free shipping
    const freeShipping = coupon.allowFreeShipping ? shippingAmount : 0;

    // Increment usage count
    coupon.usageCount = (coupon.usageCount || 0) + 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponCode: coupon.code,
        discountAmount: discount,
        freeShippingAmount: freeShipping,
        totalAfterDiscount: cartTotal - discount - freeShipping,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error applying coupon', error: error.message });
  }
};


module.exports = {
    addCoupon,
    updateCoupon,
    getCouponById,
    getAllCoupons,
    deleteCoupon,
    applyCoupon
};