const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const GiftCard = require('../models/GiftCard');

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalOrders,
            completedOrders,
            pendingOrders,
            cancelledOrders,
            totalProducts,
            totalGiftCards
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            Order.countDocuments(),
            Order.countDocuments({ status: 'completed' }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'cancelled' }),
            Product.countDocuments(),
            GiftCard.countDocuments()
        ]);


        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalUsers,
                activeUsers,
                totalOrders,
                completedOrders,
                pendingOrders,
                cancelledOrders,
                totalProducts,
                totalGiftCards
            }
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            data: null,
            error: error.message
        });
    }
};