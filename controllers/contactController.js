const Contact = require('../models/Contact');

// Create a new contact form entry
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, address, subject, message } = req.body;
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }
    const contact = new Contact({ name, email, phone, address, subject, message });
    await contact.save();
    res.status(201).json({ success: true, message: 'Contact form submitted successfully.', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting contact form', error: error.message });
  }
};
