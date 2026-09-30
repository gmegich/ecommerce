const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { notifyUser } = require('../services/notificationService');
const { supabase } = require('../config/supabase');

/**
 * GET /api/admin/dashboard
 */
const getDashboard = asyncHandler(async (_req, res) => {
  const [
    customers,
    sellers,
    pendingSellers,
    products,
    orders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    User.countByRole('customer'),
    User.countByRole('seller'),
    Seller.countByStatus('pending'),
    Product.count({ status: 'active' }),
    Order.count({}),
    Order.count({ orderStatus: 'pending' }),
    Order.count({ orderStatus: 'delivered' }),
    Order.count({ orderStatus: 'cancelled' }),
  ]);

  const { data: paidPayments, error } = await supabase
    .from('payments')
    .select('amount')
    .eq('payment_status', 'paid');

  if (error) {
    console.error('[Admin] Revenue query error:', error.message);
  }

  const totalRevenue = (paidPayments || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  res.json({
    success: true,
    message: 'Admin dashboard stats',
    data: {
      users: { customers, sellers, pendingSellers },
      products: { active: products },
      orders: {
        total: orders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        currency: 'KES',
      },
    },
  });
});

/**
 * GET /api/admin/users
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await User.findAll({
    role: req.query.role || undefined,
    accountStatus: req.query.accountStatus || undefined,
    page,
    limit,
  });

  res.json({
    success: true,
    message: 'Users retrieved',
    data: result,
  });
});

/**
 * PUT /api/admin/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot change admin status here', 400);

  const updated = await User.updateStatus(req.params.id, req.body.accountStatus);

  await notifyUser({
    userId: updated.id,
    title: 'Account status updated',
    message: `Your account status is now "${req.body.accountStatus}".`,
    type: 'system',
  });

  res.json({
    success: true,
    message: 'User status updated',
    data: { user: updated },
  });
});

/**
 * GET /api/admin/sellers
 */
const listSellers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Seller.findAll({
    verificationStatus: req.query.verificationStatus || undefined,
    page,
    limit,
  });

  res.json({
    success: true,
    message: 'Sellers retrieved',
    data: result,
  });
});

/**
 * PUT /api/admin/sellers/:id/approve
 */
const approveSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new AppError('Seller not found', 404);

  const updated = await Seller.updateVerificationStatus(seller.id, 'approved');

  await notifyUser({
    userId: seller.user_id,
    title: 'Seller approved',
    message: 'Your seller account has been approved. You can now sell on NileLink Market.',
    type: 'seller',
  });

  res.json({
    success: true,
    message: 'Seller approved',
    data: { seller: updated },
  });
});

/**
 * PUT /api/admin/sellers/:id/deactivate
 */
const deactivateSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new AppError('Seller not found', 404);

  const updated = await Seller.updateVerificationStatus(seller.id, 'deactivated');

  await notifyUser({
    userId: seller.user_id,
    title: 'Seller deactivated',
    message: 'Your seller account has been deactivated. Contact support for help.',
    type: 'seller',
  });

  res.json({
    success: true,
    message: 'Seller deactivated',
    data: { seller: updated },
  });
});

/**
 * PUT /api/admin/sellers/:id/reject
 */
const rejectSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new AppError('Seller not found', 404);

  const updated = await Seller.updateVerificationStatus(seller.id, 'rejected');

  await notifyUser({
    userId: seller.user_id,
    title: 'Seller application rejected',
    message: 'Your seller application was rejected. Contact support for details.',
    type: 'seller',
  });

  res.json({
    success: true,
    message: 'Seller rejected',
    data: { seller: updated },
  });
});

/**
 * GET /api/admin/products
 */
const listProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Product.findAll({
    status: req.query.status || null,
    search: req.query.search || undefined,
    sellerId: req.query.sellerId || undefined,
    categoryId: req.query.categoryId || undefined,
    page,
    limit,
  });

  res.json({
    success: true,
    message: 'Products retrieved',
    data: result,
  });
});

/**
 * GET /api/admin/orders
 */
const listOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Order.findAll({
    page,
    limit,
    orderStatus: req.query.orderStatus || undefined,
    paymentStatus: req.query.paymentStatus || undefined,
  });

  res.json({
    success: true,
    message: 'Orders retrieved',
    data: result,
  });
});

/**
 * GET /api/admin/categories
 */
const listCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;

  const result = await Category.findAll({
    status: req.query.status || undefined,
    page,
    limit,
  });

  res.json({
    success: true,
    message: 'Categories retrieved',
    data: result,
  });
});

/**
 * GET /api/admin/payments
 */
const listPayments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Payment.findAll({
    page,
    limit,
    paymentStatus: req.query.paymentStatus || undefined,
  });

  res.json({
    success: true,
    message: 'Payments retrieved',
    data: result,
  });
});

/**
 * GET /api/admin/complaints
 */
const listComplaints = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Complaint.findAll({
    page,
    limit,
    status: req.query.status || undefined,
  });

  res.json({
    success: true,
    message: 'Complaints retrieved',
    data: result,
  });
});

/**
 * PUT /api/admin/complaints/:id
 */
const updateComplaint = asyncHandler(async (req, res) => {
  const existing = await Complaint.findById(req.params.id);
  if (!existing) throw new AppError('Complaint not found', 404);

  const updates = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.adminNotes !== undefined) updates.admin_notes = req.body.adminNotes;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const complaint = await Complaint.updateById(req.params.id, updates);

  await notifyUser({
    userId: existing.reporter_id,
    title: 'Complaint update',
    message: `Your complaint "${existing.subject}" status is now "${complaint.status}".`,
    type: 'complaint',
  });

  res.json({
    success: true,
    message: 'Complaint updated',
    data: { complaint },
  });
});

/**
 * GET /api/admin/reports
 */
const getReports = asyncHandler(async (_req, res) => {
  const [ordersByStatus, sellersByStatus, topProducts] = await Promise.all([
    Promise.all(
      ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(
        async (status) => ({ status, count: await Order.count({ orderStatus: status }) })
      )
    ),
    Promise.all(
      ['pending', 'approved', 'rejected', 'deactivated'].map(async (status) => ({
        status,
        count: await Seller.countByStatus(status),
      }))
    ),
    Product.findAll({ status: 'active', sort: 'rating', page: 1, limit: 10 }),
  ]);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, order_status, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  res.json({
    success: true,
    message: 'Reports generated',
    data: {
      ordersByStatus,
      sellersByStatus,
      topRatedProducts: topProducts.products || [],
      recentOrders: recentOrders || [],
    },
  });
});

module.exports = {
  getDashboard,
  listUsers,
  updateUserStatus,
  listSellers,
  approveSeller,
  deactivateSeller,
  rejectSeller,
  listProducts,
  listOrders,
  listCategories,
  listPayments,
  listComplaints,
  updateComplaint,
  getReports,
};
