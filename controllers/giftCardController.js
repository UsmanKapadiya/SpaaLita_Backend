const GiftCard = require('../models/GiftCard');

// Add new gift card
const addGiftCard = async (req, res) => {
  try {
    const { productName, sku, price, qty, productImages, description, category } = req.body;
    if (!productName || !sku || !price || !qty || !description || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existingGiftCard = await GiftCard.findOne({ sku });
    if (existingGiftCard) {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    const giftCard = new GiftCard({ productName, sku, price, qty, productImages, description, category });
    await giftCard.save();
    res.status(201).json({ success: true, message: 'Gift card created successfully', data: giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating gift card', error: error.message });
  }
};

// Update gift card
const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.sku) {
      const existingGiftCard = await GiftCard.findOne({ sku: updates.sku, _id: { $ne: id } });
      if (existingGiftCard) {
        return res.status(409).json({ success: false, message: 'SKU already exists' });
      }
    }
    const giftCard = await GiftCard.findByIdAndUpdate(id, updates, { new: true });
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    res.status(200).json({ success: true, message: 'Gift card updated successfully', data: giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating gift card', error: error.message });
  }
};

// Delete gift card (soft delete)
const deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    res.status(200).json({ success: true, message: 'Gift Card deleted (status set to inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting gift card', error: error.message });
  }
};

// Get all gift cards (active only)
const getGiftCards = async (req, res) => {
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
      const products = await GiftCard.find(query)
        .skip(skip)
        .limit(parseInt(limit));
      const total = await GiftCard.countDocuments(query);
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
    res.status(500).json({ success: false, message: 'Error fetching gift cards', error: error.message });
  }
};

// Get single gift card
const getGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);
    if (!giftCard || giftCard.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    res.status(200).json({ success: true, data: giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching gift card', error: error.message });
  }
};

// Get related gift cards (same category, exclude self, only active)
const getRelatedGiftCards = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);
    if (!giftCard || giftCard.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    const related = await GiftCard.find({
      _id: { $ne: id },
      category: giftCard.category,
      status: { $ne: 'inactive' }
    }).limit(10);
    res.status(200).json({ success: true, data: related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching related gift cards', error: error.message });
  }
};

module.exports = {
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getGiftCards,
  getGiftCard,
  getRelatedGiftCards,
};
