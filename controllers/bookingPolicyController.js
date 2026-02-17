const BookingPolicy = require('../models/BookingPolicy');

// Add new booking policy
const addBookingPolicy = async (req, res) => {
  try {
    const { title, description, buttonUrl, status } = req.body;
    if (!title || !description || !buttonUrl) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    // If status is active, set all others to inactive
    let newStatus = status;
    if (status === 'active') {
      await BookingPolicy.updateMany({ status: 'active' }, { status: 'inactive' });
    } else if (!status) {
      newStatus = 'inactive';
    }
    const policy = new BookingPolicy({ title, description, buttonUrl, status: newStatus });
    await policy.save();
    res.status(201).json({ success: true, message: 'Booking policy created successfully', data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating booking policy', error: error.message });
  }
};

// Update booking policy
const updateBookingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // If status is being set to active, set all others to inactive
    if (updates.status === 'active') {
      await BookingPolicy.updateMany({ status: 'active' }, { status: 'inactive' });
    }
    const policy = await BookingPolicy.findByIdAndUpdate(id, updates, { new: true });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Booking policy not found' });
    }
    res.status(200).json({ success: true, message: 'Booking policy updated successfully', data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking policy', error: error.message });
  }
};

// Delete booking policy
const deleteBookingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await BookingPolicy.findByIdAndDelete(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Booking policy not found' });
    }
    res.status(200).json({ success: true, message: 'Booking policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting booking policy', error: error.message });
  }
};

// Get all booking policies
const getBookingPolicies = async (req, res) => {
  try {
    const policies = await BookingPolicy.find();
    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking policies', error: error.message });
  }
};

// Get single booking policy
const getBookingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await BookingPolicy.findById(id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Booking policy not found' });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking policy', error: error.message });
  }
};

module.exports = {
  addBookingPolicy,
  updateBookingPolicy,
  deleteBookingPolicy,
  getBookingPolicies,
  getBookingPolicy,
};
