const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * Phase 2 smoke checks — confirms models can read Supabase tables.
 * Not a public feature endpoint; useful during development.
 */
const getModelStatus = async (req, res, next) => {
  try {
    const [
      categories,
      productCount,
      customerCount,
      sellerCount,
      orderCount,
    ] = await Promise.all([
      Category.findAll({ status: 'active', limit: 20 }),
      Product.count({ status: 'active' }),
      User.countByRole('customer'),
      Seller.countByStatus(),
      Order.count(),
    ]);

    res.json({
      success: true,
      message: 'Phase 2 models are connected to Supabase',
      data: {
        phase: 2,
        tables: {
          categories: categories.pagination.total,
          products: productCount,
          customers: customerCount,
          sellers: sellerCount,
          orders: orderCount,
        },
        sampleCategories: categories.categories.map((c) => ({
          id: c.id,
          name: c.name,
        })),
        models: [
          'User',
          'Seller',
          'Category',
          'Product',
          'Cart',
          'Order',
          'Payment',
          'Review',
          'Message',
          'Notification',
          'Complaint',
        ],
      },
    });
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Model status check failed', 500, error.message)
    );
  }
};

module.exports = {
  getModelStatus,
};
