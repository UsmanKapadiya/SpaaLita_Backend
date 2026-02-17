const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CLF Backend API' });
});


// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingPolicyRoutes = require('./routes/bookingPolicyRoutes');
const monthlySpecialRoutes = require('./routes/monthlySpecialRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const roleRoutes = require('./routes/roleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const aboutRoutes = require('./routes/aboutRoutes');
// const newsRoutes = require('./routes/newsRoutes');
// const galleryRoutes = require('./routes/galleryRoutes');
// const videoRoutes = require('./routes/videoRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');
// const contactRoutes = require('./routes/contactRoutes');

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/booking-policies', bookingPolicyRoutes);
app.use('/api/monthly-special', monthlySpecialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
// app.use('/api/about', aboutRoutes);
// app.use('/api/news', newsRoutes);
// app.use('/api/gallery', galleryRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
