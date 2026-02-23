const Service = require('../models/Service');

// Add new service
const addService = async (req, res) => {
  try {
    const { serviceName, serviceImage, serviceDescription, buttonUrl } = req.body;
    if (!serviceName || !serviceImage || !serviceDescription  || !buttonUrl) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const service = new Service({ serviceName, serviceImage, serviceDescription, buttonUrl });
    await service.save();
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating service', error: error.message });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating service', error: error.message });
  }
};

// Delete service (soft delete)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service soft deleted (status set to inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting service', error: error.message });
  }
};

// Get all services (active only)
const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      status: { $ne: 'inactive' },
      ...(search && {
        serviceName: { $regex: search, $options: 'i' }
      })
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [services, total] = await Promise.all([
      Service.find(query).skip(skip).limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching services', error: error.message });
  }
};

// Get single service
const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service || service.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching service', error: error.message });
  }
};

module.exports = {
  addService,
  updateService,
  deleteService,
  getServices,
  getService,
};
