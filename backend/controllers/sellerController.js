const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { supabase } = require('../config/supabase');

/**
 * GET /api/seller/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const seller = await Seller.findByUserId(req.user.id);
  if (!seller) throw new AppError('Seller profile not found', 404);

  const [productCount, orderCount, pendingOrders, deliveredOrders] = await Promise.all([
    Product.count({ sellerId: seller.id, status: 'active' }),
    Order.count({ sellerId: seller.id }),
    Order.count({ sellerId: seller.id, orderStatus: 'pending' }),
    Order.count({ sellerId: seller.id, orderStatus: 'delivered' }),
  ]);

  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('seller_id', seller.id)
    .eq('payment_status', 'paid');

  const revenue = (paidOrders || []).reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  );

  const recent = await Order.findBySeller(seller.id, { page: 1, limit: 5 });

  res.json({
    success: true,
    message: 'Seller dashboard stats',
    data: {
      seller: {
        id: seller.id,
        business_name: seller.business_name,
        verification_status: seller.verification_status,
      },
      stats: {
        products: productCount,
        orders: orderCount,
        pendingOrders,
        deliveredOrders,
        revenue: Number(revenue.toFixed(2)),
        currency: 'KES',
      },
      recentOrders: recent.orders || [],
    },
  });
});

/**
 * GET /api/seller/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findByUserId(req.user.id);
  if (!seller) throw new AppError('Seller profile not found', 404);

  res.json({
    success: true,
    message: 'Seller profile retrieved',
    data: { seller },
  });
});

/**
 * PUT /api/seller/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findByUserId(req.user.id);
  if (!seller) throw new AppError('Seller profile not found', 404);

  if (seller.verification_status === 'deactivated') {
    throw new AppError('Your seller account is deactivated', 403);
  }

  const updates = {};
  if (req.body.businessName !== undefined) updates.business_name = req.body.businessName.trim();
  if (req.body.businessDescription !== undefined) {
    updates.business_description = req.body.businessDescription || null;
  }
  if (req.body.businessLocation !== undefined) {
    updates.business_location = req.body.businessLocation || null;
  }
  if (req.body.contactInformation !== undefined) {
    updates.contact_information = req.body.contactInformation || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const updated = await Seller.updateById(seller.id, updates);

  res.json({
    success: true,
    message: 'Seller profile updated',
    data: { seller: updated },
  });
});

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
};
