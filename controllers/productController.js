const Product = require('../models/Product');

// Add new product
const addProduct = async (req, res) => {
  try {
    const { productName, sku, price, qty, description, category } = req.body;

    if (!productName || !sku || !price || !qty || !description || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }

    // get uploaded images
    const productImages = req.files.map(file => file.filename);

    const product = new Product({
      productName,
      sku,
      price,
      qty,
      description,
      category,
      productImages
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { existingImages } = req.body;
    const newImages = req.files ? req.files.map(f => f.filename) : [];

    const productImages = [...(existingImages || []), ...newImages];

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, productImages },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null
      });
    }

    // Return success in same format as create API
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
};

// Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product soft deleted (status set to inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = '' } = req.query;

    const query = {
      status: { $ne: 'inactive' },
      productImages: { $exists: true }
    };

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // ✅ SORTING LOGIC
    let sortOption = {};

    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;

      case 'price_low_high':
        sortOption = { price: 1 };
        break;

      case 'price_high_low':
        sortOption = { price: -1 };
        break;

      case 'popular':
        sortOption = { soldCount: -1 }; // or views field
        break;

      case 'recommended':
        sortOption = { rating: -1 }; // or featured: true
        break;

      default:
        sortOption = { createdAt: -1 }; // default latest
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOption) // ✅ apply sorting
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};
// const getProducts = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = '' } = req.query;
//     const query = {
//       status: { $ne: 'inactive' },
//       productImages: { $exists: true }

//     };
//     if (search) {
//       query.$or = [
//         { productName: { $regex: search, $options: 'i' } },
//         { sku: { $regex: search, $options: 'i' } },
//         { category: { $regex: search, $options: 'i' } }
//       ];
//     }
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const products = await Product.find(query)
//       .skip(skip)
//       .limit(parseInt(limit));
//     const total = await Product.countDocuments(query);
//     res.status(200).json({
//       success: true,
//       data: products,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
//   }
// };

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product || product.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
};

// Get related products (same category, exclude self, only active)
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product || product.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const related = await Product.find({
      _id: { $ne: id },
      category: product.category,
      status: { $ne: 'inactive' }
    }).limit(4);
    res.status(200).json({ success: true, data: related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching related products', error: error.message });
  }
};

// Apply coupon to product
const applyCoupon = async (req, res) => {
  try {
    const { productId, couponCode } = req.body;
    if (!productId || !couponCode) {
      return res.status(400).json({ success: false, message: 'Product ID and coupon code are required' });
    }
    const product = await Product.findById(productId);
    if (!product || product.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    // Simple coupon validation (you can expand this with a Coupon model)
    const coupons = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FLAT50': { discount: 50, type: 'fixed' }
    };
    const coupon = coupons[couponCode.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }
    let discountedPrice = product.price;
    if (coupon.type === 'percentage') {
      discountedPrice = product.price - (product.price * coupon.discount / 100);
    } else if (coupon.type === 'fixed') {
      discountedPrice = Math.max(0, product.price - coupon.discount);
    }
    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        product: product.productName,
        originalPrice: product.price,
        discount: coupon.discount,
        discountType: coupon.type,
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        savings: parseFloat((product.price - discountedPrice).toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error applying coupon', error: error.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
  applyCoupon,
};
