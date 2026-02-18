// Delete order (admin)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
  }
};
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create order and payment intent
const createOrder = async (req, res) => {
  try {
    console.log("stripe", stripe);
    const { items, totalAmount, shippingAddress, billingAddress } = req.body;
    const userId = req.user.id;
    // Validate user exists
    const User = require('../models/User');
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(400).json({ success: false, message: 'User not found. Cannot create order.' });
    }
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
      billingAddress,
    });
    await order.save();
    // Populate user and product details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'userName email')
      .populate('items.productId', 'productName');

    // Format items to include productName
    const formattedItems = populatedOrder.items.map(item => {
      let productName = item.productId && item.productId.productName ? item.productId.productName : item.name;
      return {
        ...item.toObject(),
        productName
      };
    });
    const orderObj = populatedOrder.toObject();
    const responseOrder = {
      ...orderObj,
      user: populatedOrder.user,
      items: formattedItems,
      shippingAddress: orderObj.shippingAddress || '',
      billingAddress: orderObj.billingAddress || ''
    };
    res.status(201).json({ success: true, message: 'Order created', data: responseOrder, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
  }
};

// Get all orders (admin) or user orders with pagination
const getOrders = async (req, res) => {
  try {
    // Pagination params
    let { page = 1, limit = 10, search = '', status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    if (status && status !== '') {
      query.status = status;
    }

    // If search is provided, build $or query for userName, email, status, or productName (from products array)
    let userOrProductMatch = [];
    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');
      userOrProductMatch.push(
        { status: regex },
        { 'user.userName': regex },
        { 'user.email': regex },
        { 'products.productName': regex }
      );
    }

    // Aggregate pipeline for search and pagination
    const pipeline = [];
    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }
    pipeline.push(
      { $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'products'
        }
      }
    );
    // If searching, match after lookups so productName is available
    if (userOrProductMatch.length > 0) {
      pipeline.push({ $match: { $or: userOrProductMatch } });
    }
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, pipeline.findIndex(p => p.$skip !== undefined || p.$limit !== undefined));
    countPipeline.push({ $count: 'total' });
    const totalResult = await Order.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Get paginated orders
    let orders = await Order.aggregate(pipeline);

    // Attach productName to items
    orders = orders.map(order => {
      const formattedItems = order.items.map(item => {
        let product = (order.products || []).find(p => p._id.toString() === (item.productId ? item.productId.toString() : ''));
        let productName = product ? product.productName : item.name;
        return {
          ...item,
          productName
        };
      });
      return {
        ...order,
        user: order.user,
        items: formattedItems,
        shippingAddress: order.shippingAddress || ''
      };
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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

// Update order (admin)
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowedFields = ['status', 'paymentStatus', 'billingAddress', 'shippingAddress'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const order = await Order.findByIdAndUpdate(id, updates, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  handleStripeWebhook
};
