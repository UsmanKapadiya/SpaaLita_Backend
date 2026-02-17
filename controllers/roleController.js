const Role = require('../models/Role');

// Add new role
const addRole = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(409).json({ success: false, message: 'Role name already exists' });
    }
    const role = new Role({ name, description, status });
    await role.save();
    res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating role', error: error.message });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.name) {
      const existingRole = await Role.findOne({ name: updates.name, _id: { $ne: id } });
      if (existingRole) {
        return res.status(409).json({ success: false, message: 'Role name already exists' });
      }
    }
    const role = await Role.findByIdAndUpdate(id, updates, { new: true });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.status(200).json({ success: true, message: 'Role updated successfully', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating role', error: error.message });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting role', error: error.message });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching roles', error: error.message });
  }
};

// Get single role
const getRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching role', error: error.message });
  }
};

module.exports = {
  addRole,
  updateRole,
  deleteRole,
  getRoles,
  getRole,
};
