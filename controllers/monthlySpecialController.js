const MonthlySpecial = require('../models/MonthlySpecial');

// Add new monthly special (only one allowed)
const addMonthlySpecial = async (req, res) => {
  try {
    const { title, image } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const count = await MonthlySpecial.countDocuments();
    if (count > 0) {
      return res.status(409).json({ success: false, message: 'A monthly special already exists. Only one is allowed.' });
    }
    const special = new MonthlySpecial({ title, image });
    await special.save();
    res.status(201).json({ success: true, message: 'Monthly special created successfully', data: special });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating monthly special', error: error.message });
  }
};

// Update monthly special
const updateMonthlySpecial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const special = await MonthlySpecial.findByIdAndUpdate(id, updates, { new: true });
    if (!special) {
      return res.status(404).json({ success: false, message: 'Monthly special not found' });
    }
    res.status(200).json({ success: true, message: 'Monthly special updated successfully', data: special });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating monthly special', error: error.message });
  }
};

// Delete monthly special
const deleteMonthlySpecial = async (req, res) => {
  try {
    const { id } = req.params;
    const special = await MonthlySpecial.findByIdAndDelete(id);
    if (!special) {
      return res.status(404).json({ success: false, message: 'Monthly special not found' });
    }
    res.status(200).json({ success: true, message: 'Monthly special deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting monthly special', error: error.message });
  }
};

// Get monthly special (the only one)
const getMonthlySpecial = async (req, res) => {
  try {
    const special = await MonthlySpecial.findOne();
    if (!special) {
      return res.status(404).json({ success: false, message: 'Monthly special not found' });
    }
    res.status(200).json({ success: true, data: special });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching monthly special', error: error.message });
  }
};

module.exports = {
  addMonthlySpecial,
  updateMonthlySpecial,
  deleteMonthlySpecial,
  getMonthlySpecial,
};
