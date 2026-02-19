const Product = require('../models/Product');

// Add new product
const addProduct = async (req, res) => {
  try {
    const { productName, sku, price, qty, productImages, description, category } = req.body;
    if (!productName || !sku || !price || !qty || !description || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    const product = new Product({ productName, sku, price, qty, productImages, description, category });
    await product.save();
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.sku) {
      const existingProduct = await Product.findOne({ sku: updates.sku, _id: { $ne: id } });
      if (existingProduct) {
        return res.status(409).json({ success: false, message: 'SKU already exists' });
      }
    }
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
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

// Get all products (active only)
// Get all products (active only) with pagination and search, no token required
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      status: { $ne: 'inactive' }
    };
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
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
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
};

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
    }).limit(10);
    res.status(200).json({ success: true, data: related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching related products', error: error.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
};
