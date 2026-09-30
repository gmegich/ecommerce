const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/complaints — authenticated users
 */
const createComplaint = asyncHandler(async (req, res) => {
  const { subject, description, reportedUserId, productId } = req.body;

  if (reportedUserId) {
    const reported = await User.findById(reportedUserId);
    if (!reported) throw new AppError('Reported user not found', 404);
  }

  if (productId) {
    const product = await Product.findById(productId);
    if (!product) throw new AppError('Product not found', 404);
  }

  const complaint = await Complaint.create({
    reporter_id: req.user.id,
    reported_user_id: reportedUserId || null,
    product_id: productId || null,
    subject: subject.trim(),
    description: description.trim(),
    status: 'pending',
  });

  // Soft-notify: no specific admin user id — skip unless you have a system admin
  res.status(201).json({
    success: true,
    message: 'Complaint submitted',
    data: { complaint },
  });
});

/**
 * GET /api/complaints/mine
 */
const listMyComplaints = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  // Reuse findAll then filter — Complaint model has no findByReporter; use supabase via findAll pattern
  const { supabase } = require('../config/supabase');
  const { throwIfError } = require('../models/helpers');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('complaints')
    .select(
      `*,
      reported_user:reported_user_id(id, name, email),
      product:product_id(id, name)`,
      { count: 'exact' }
    )
    .eq('reporter_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  throwIfError(error, 'Unable to list complaints');

  res.json({
    success: true,
    message: 'Your complaints retrieved',
    data: {
      complaints: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit) || 1,
      },
    },
  });
});

/**
 * GET /api/complaints/:id
 */
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404);

  if (
    complaint.reporter_id !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    message: 'Complaint retrieved',
    data: { complaint },
  });
});

module.exports = {
  createComplaint,
  listMyComplaints,
  getComplaint,
};
