const Product = require('../models/Product');
const Category = require("../models/Category"); 


// Add new product
const addProduct = async (req, res) => {
  try {
    let {
      productName,
      sku,
      price,
      qty,
      description,
      slug,
      regular_price,
      sale_price,
      short_description,
      tax_status,
      shipping_required,
      shipping_taxable,
      stock_status,
      categories,
      related_ids
    } = req.body;

    // ✅ Fix categories parsing (handles all cases)
    categories = categories || req.body["categories[]"] || [];

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = [categories];
      }
    }

    if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // ✅ Required fields check (FIXED)
    if (!productName || !sku || !price || !qty || !description || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // ✅ SKU check
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    // ✅ Images
    const productImages = req.files ? req.files.map(f => f.filename) : [];

    // ✅ Create product
    const product = new Product({
      productName,
      sku,
      price,
      qty,
      description,
      productImages,
      slug: slug || '',
      regular_price: regular_price || '',
      sale_price: sale_price || '',
      short_description: short_description || '',
      tax_status: tax_status || 'none',
      shipping_required: shipping_required !== undefined ? shipping_required : true,
      shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
      stock_status: stock_status || 'instock',
      categories,
      related_ids: related_ids || []
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    let {
      productName,
      sku,
      price,
      qty,
      description,
      slug,
      regular_price,
      sale_price,
      short_description,
      tax_status,
      shipping_required,
      shipping_taxable,
      stock_status,
      categories,
      related_ids,
      existingImages
    } = req.body;

    // ✅ Parse categories (IMPORTANT)
    categories = categories || req.body["categories[]"] || [];

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = [categories];
      }
    }

    if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // ✅ Parse existingImages (IMPORTANT)
    if (typeof existingImages === "string") {
      try {
        existingImages = JSON.parse(existingImages);
      } catch {
        existingImages = [existingImages];
      }
    }

    if (!Array.isArray(existingImages)) {
      existingImages = existingImages ? [existingImages] : [];
    }

    // ✅ New uploaded images
    const newImages = req.files ? req.files.map(f => f.filename) : [];

    // ✅ Merge images
    const productImages = [...existingImages, ...newImages];

    // ✅ Update object (clean & controlled)
    const updateData = {
      productName,
      sku,
      price,
      qty,
      description,
      slug: slug || '',
      regular_price: regular_price || '',
      sale_price: sale_price || '',
      short_description: short_description || '',
      tax_status: tax_status || 'none',
      shipping_required: shipping_required !== undefined ? shipping_required : true,
      shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
      stock_status: stock_status || 'instock',
      categories,
      related_ids: related_ids || [],
      productImages
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
};


//Get All Products
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch all categories and flatten them
    const allCategories = await Category.find().lean();
    const flatCategories = flattenCategoriesTree(allCategories); // same flatten helper as in details API

    // 2 Build base query
    const query = {
      status: { $ne: 'inactive' },
      productImages: { $exists: true, $ne: [] }
    };

    // 3 Fetch products
    let products = await Product.find(query)
      .sort(getSortOption(sort))
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // use lean to simplify mapping

    // 4 Map product categories using flattened categories
    products = products.map(product => {
      const productCategories = [];
      if (Array.isArray(product.categories)) {
        product.categories.forEach(catId => {
          const found = flatCategories.find(c => c._id === String(catId));
          if (found) productCategories.push(found);
        });
      }
      return {
        ...product,
        categories: productCategories
      };
    });

    // 5 Count total
    const total = await Product.countDocuments(query);

    // 6 Return response
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
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
};

// Helper: flatten category tree
function flattenCategoriesTree(categories) {
  const result = [];
  categories.forEach(cat => {
    result.push({ _id: String(cat._id), name: cat.name, slug: cat.slug });
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(child => {
        result.push({ _id: String(child._id), name: child.name, slug: child.slug });
      });
    }
  });
  return result;
}

// Helper: get sort option
function getSortOption(sort) {
  switch (sort) {
    case 'latest': return { createdAt: -1 };
    case 'price_low_high': return { price: 1 };
    case 'price_high_low': return { price: -1 };
    case 'popular': return { soldCount: -1 };
    case 'recommended': return { rating: -1 };
    default: return { createdAt: -1 };
  }
}

// Products Details 
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1 Fetch product
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2 Fetch all categories and flatten them
    const allCategories = await Category.find().lean();
    const flatCategories = flattenCategoriesTree(allCategories);

    // 3 Map product category IDs to actual category objects
    const productCategories = [];
    const missingCategories = [];

    if (Array.isArray(product.categories)) {
      product.categories.forEach(catId => {
        const found = flatCategories.find(c => c._id === String(catId));
        if (found) {
          productCategories.push(found);
        } else {
          missingCategories.push(catId);
        }
      });
    }

    // 4 Log missing categories
    if (missingCategories.length > 0) {
      console.warn(`Product "${product.productName}" has missing categories:`, missingCategories);
    }

    // 5 Attach populated categories
    product.categories = productCategories;

    //6 Return product details
    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching product details",
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
