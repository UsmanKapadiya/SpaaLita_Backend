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
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'inactive' } });
    res.status(200).json({ success: true, data: products });
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
