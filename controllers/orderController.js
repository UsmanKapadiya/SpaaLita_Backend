const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create order and payment intent
const createOrder = async (req, res) => {
  try {
    console.log("stripe", stripe);
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user.id;
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Order items and total amount are required' });
    }
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: { userId },
    });
    // Create order in DB
    const order = new Order({
      user: userId,
      items,
      totalAmount,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      shippingAddress,
    });
    await order.save();
    res.status(201).json({ success: true, message: 'Order created', data: order, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
  }
};

// Get all orders (admin) or user orders
const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('user', 'userName email');
    } else {
      orders = await Order.find({ user: req.user.id });
    }
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'succeeded', status: 'paid' }
    );
  }
  // Handle payment_intent.payment_failed
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'failed', status: 'failed' }
    );
  }
  res.json({ received: true });
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  handleStripeWebhook,
};
