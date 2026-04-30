const User = require('../models/User');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Add new user
const addUser = async (req, res) => {
  try {
    const {
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

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use uploaded file
    const profilePicture = req.file ? `/uploads/userProfile/${req.file.filename}` : null;

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
      password: hashedPassword,
      role,
      status
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userName, firstName, lastName, email, phone, country, city, address, postalCode, role, status } = req.body;
    const userId = req.params.id;

    const updates = { userName, firstName, lastName, email, phone, country, city, address, postalCode, role, status };

    // If profile picture uploaded, update it
    if (req.file && req.file.filename) {
      updates.profilePicture = `userProfile/${req.file.filename}`; // Save path for frontend
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     // Prevent updating email or userName to an existing one
//     if (updates.userName || updates.email) {
//       const existingUser = await User.findOne({
//         $or: [
//           updates.userName ? { userName: updates.userName } : {},
//           updates.email ? { email: updates.email } : {}
//         ],
//         _id: { $ne: id }
//       });
//       if (existingUser) {
//         return res.status(409).json({ success: false, message: 'User name or email already exists' });
//       }
//     }
//     const user = await User.findByIdAndUpdate(id, updates, { new: true });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.status(200).json({ success: true, message: 'User updated successfully', data: user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
//   }
// };

// Update user billing and shipping addresses
const updateUserAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const { billing, shipping } = req.body;

    if (!billing && !shipping) {
      return res.status(400).json({ success: false, message: "No address data provided" });
    }

    // Build update object
    const updates = {};
    if (billing) updates.billing = billing;
    if (shipping) updates.shipping = shipping;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User addresses updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating addresses",
      error: error.message,
    });
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
    res.status(200).json({ success: true, message: 'User deleted SuccessFully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build search query for name, email, role
    let query = { status: { $ne: 'inactive' } };
    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { userName: regex },
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { role: regex }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const updatedUsers = users.map(user => ({
      ...user._doc,
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`
        : null
    }));

    res.status(200).json({
      success: true,
      data: updatedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    const updatedUser = {
      ...user._doc,
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`
        : null
    };
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};


// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          country: user.country,
          city: user.city,
          address: user.address,
          postalCode: user.postalCode,
          profilePicture: user.profilePicture,
          role: user.role,
          status: user.status,
          billing: user.billing,
          shipping: user.shipping,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

// User Logout (client should just delete token, but for completeness)
const logoutUser = async (req, res) => {
  // For stateless JWT, logout is handled on client by deleting token.
  // Optionally, you can implement token blacklisting here.
  res.status(200).json({ success: true, message: 'Logout successful' });
};

const forgotPassword = async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email && !userName) {
      return res.status(400).json({
        success: false,
        message: "Email or userName is required",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { userName }],
      status: "active",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Reset password link generated",
      resetLink,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in forgot password",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token invalid or expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

module.exports = {
  addUser,
  updateUser,
  updateUserAddresses,
  deleteUser,
  getUsers,
  getUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword
};
