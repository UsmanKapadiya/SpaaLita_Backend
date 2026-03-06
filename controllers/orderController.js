const mongoose = require('mongoose');


const Order = require('../models/Order');
const User = require('../models/User');
const bcrypt = require("bcryptjs");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create order and payment intent
// const createOrder = async (req, res) => {
//   try {
//     const {
//       items,
//       totalAmount,
//       shippingAddress,
//       billingAddress,
//       coupon,
//       guestInfo
//     } = req.body;

//     const userId = req.user?.id || null;

//     // If no user and no guest info
//     if (!userId && !guestInfo) {
//       return res.status(400).json({
//         success: false,
//         message: "Guest information required",
//       });
//     }

//     // Validate user only if logged in
//     if (userId) {
//       const userDoc = await User.findById(userId);
//       if (!userDoc) {
//         return res.status(400).json({
//           success: false,
//           message: "User not found",
//         });
//       }
//     }

//     if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "Order items and total amount are required",
//       });
//     }

//     let finalAmount = totalAmount;

//     if (coupon && coupon.discountAmount) {
//       finalAmount = Math.max(0, totalAmount - coupon.discountAmount);
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(finalAmount * 100),
//       currency: "usd",
//       metadata: {
//         userId: userId || "guest",
//         email: guestInfo?.email || "",
//         couponCode: coupon?.code || "",
//       },
//     });

//     const order = new Order({
//       user: userId,
//       guestInfo: userId ? null : guestInfo,
//       items,
//       totalAmount: finalAmount,
//       status: "pending",
//       paymentIntentId: paymentIntent.id,
//       paymentStatus: "pending",
//       shippingAddress,
//       billingAddress,
//       coupon: coupon || null,
//     });

//     await order.save();

//     res.status(201).json({
//       success: true,
//       message: "Order created",
//       data: order,
//       clientSecret: paymentIntent.client_secret,
//     });

//   } catch (error) {
//     console.error("Create Order Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating order",
//       error: error.message,
//     });
//   }
// };

// Create Order API
const createOrder = async (req, res) => {
  try {

    const {
      items,
      totalAmount,
      shippingAddress,
      billingAddress,
      coupon,
      guestInfo,
      createAccount
    } = req.body;

    let userId = req.user?.id || null;

    // Validate order items
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Order items and total amount are required"
      });
    }

    // Guest checkout validation
    if (!userId && !guestInfo) {
      return res.status(400).json({
        success: false,
        message: "Guest information required"
      });
    }

    // ------------------------------------------------
    // CREATE USER ACCOUNT IF REQUESTED
    // ------------------------------------------------
    if (!userId && createAccount && guestInfo?.email) {

      let existingUser = await User.findOne({ email: guestInfo.email });

      if (!existingUser) {

        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const userName = `${billingAddress.firstName}${billingAddress.lastName}`.replace(/\s/g, "").toLowerCase();

        const newUser = new User({
          userName, // required
          firstName: billingAddress.firstName, // required
          lastName: billingAddress.lastName,   // required
          email: guestInfo.email,              // required
          phone: billingAddress.phone,         // required
          country: billingAddress.country,     // required
          city: billingAddress.city,           // required
          address: billingAddress.address1,    // required
          postalCode: billingAddress.postcode, // required
          password: hashedPassword,

          // optional nested info
          billing: billingAddress,
          shipping: shippingAddress
        });

        await newUser.save();

        userId = newUser._id;

        console.log("Guest converted to registered user:", guestInfo.email);

      } else {
        userId = existingUser._id;
      }
    }

    // ------------------------------------------------
    // COUPON DISCOUNT
    // ------------------------------------------------
    let finalAmount = totalAmount;

    if (coupon && coupon.discountAmount) {
      finalAmount = Math.max(0, totalAmount - coupon.discountAmount);
    }

    // ------------------------------------------------
    // CREATE STRIPE PAYMENT INTENT
    // ------------------------------------------------

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: "usd",
      metadata: {
        userId: userId ? userId.toString() : "guest",
        email: guestInfo?.email || "",
        couponCode: coupon?.code || ""
      }
    });

    // ------------------------------------------------
    // CREATE ORDER
    // ------------------------------------------------
    const order = new Order({
      user: userId,
      guestInfo: userId ? null : guestInfo,
      items,
      totalAmount: finalAmount,
      status: "pending",
      paymentIntentId: paymentIntent.id,
      paymentStatus: "pending",
      shippingAddress,
      billingAddress,
      coupon: coupon || null
    });

    await order.save();

    // ------------------------------------------------
    // POPULATE DATA
    // ------------------------------------------------
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("items.productId", "productName");

    const formattedItems = populatedOrder.items.map(item => {
      const productName = item.productId?.productName || item.name;

      return {
        ...item.toObject(),
        productName
      };
    });

    const orderObj = populatedOrder.toObject();

    const responseOrder = {
      ...orderObj,
      items: formattedItems,
      shippingAddress: orderObj.shippingAddress || {},
      billingAddress: orderObj.billingAddress || {},
      coupon: orderObj.coupon || null
    };

    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: responseOrder,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {

    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
};



// Get all orders (admin) or user orders with pagination
const getOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const pipeline = [];
    const matchQuery = {};

    if (req.user.role !== 'admin') {
      matchQuery.user = new mongoose.Types.ObjectId(req.user.id);
    }

    if (status && status !== '') {
      matchQuery.status = status;
    }

    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'products'
        }
      }
    );

    if (search && search.trim() !== '') {
      const regex = new RegExp(search, 'i');

      pipeline.push({
        $match: {
          $or: [
            { status: regex },
            { 'user.userName': regex },
            { 'user.email': regex },
            { 'products.productName': regex }
          ]
        }
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Order.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $skip: skip }, { $limit: limit });

    let orders = await Order.aggregate(pipeline);

    orders = orders.map(order => {
      const formattedItems = order.items.map(item => {
        const product = (order.products || []).find(
          p => p._id.toString() === item.productId?.toString()
        );

        return {
          ...item,
          productName: product ? product.productName : item.name
        };
      });

      return {
        ...order,
        items: formattedItems,
        shippingAddress: order.shippingAddress || ''
      };
    });

    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
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

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  handleStripeWebhook
};
