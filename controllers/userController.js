const User = require('../models/User');

// Add new user
const addUser = async (req, res) => {
  try {
    const {
      profilePicture,
      userName,
      firstName,
      lastName,
      email,
      phone,
      country,
      city,
      address,
      postalCode,
      password,
      role,
      status
    } = req.body;

    if (!userName || !firstName || !lastName || !email || !phone || !country || !city || !address || !postalCode || !password) {
      const missingFields = [];
      if (!userName) missingFields.push('userName');
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      if (!country) missingFields.push('country');
      if (!city) missingFields.push('city');
      if (!address) missingFields.push('address');
      if (!postalCode) missingFields.push('postalCode');
      if (!password) missingFields.push('password');
      return res.status(400).json({ success: false, message: 'All fields are required', missingFields });
    }

    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User name or email already exists' });
    }

    const user = new User({
      profilePicture,
      userName,
      firstName,
      lastName,
      email,
      phone,
      country,
      city,
      address,
      postalCode,
      password,
      role,
      status
    });
    await user.save();
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Prevent updating email or userName to an existing one
    if (updates.userName || updates.email) {
      const existingUser = await User.findOne({
        $or: [
          updates.userName ? { userName: updates.userName } : {},
          updates.email ? { email: updates.email } : {}
        ],
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User name or email already exists' });
      }
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User soft deleted (status set to inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ status: { $ne: 'inactive' } });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

module.exports = {
  addUser,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
};
