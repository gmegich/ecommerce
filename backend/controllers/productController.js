const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const assertSellerCanSell = async (userId) => {
  const seller = await Seller.findByUserId(userId);
  if (!seller) {
    throw new AppError('Seller profile not found. Complete seller registration first.', 404);
  }
  if (seller.verification_status === 'deactivated') {
    throw new AppError('Your seller account is deactivated. Contact support.', 403);
  }
  if (seller.verification_status === 'rejected') {
    throw new AppError('Your seller account was rejected. Contact support.', 403);
  }
  return seller;
};

/**
 * GET /api/products — public list/search/filter/sort/paginate
 */
const listProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const result = await Product.findAll({
    search: req.query.search || undefined,
    categoryId: req.query.categoryId || undefined,
    sellerId: req.query.sellerId || undefined,
    minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
    status: req.query.status || 'active',
    availability: req.query.availability || undefined,
    sort: req.query.sort || 'newest',
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
 * GET /api/products/:id
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.status === 'deleted') {
    throw new AppError('Product not found', 404);
  }

  res.json({
    success: true,
    message: 'Product retrieved',
    data: { product },
  });
});

/**
 * GET /api/products/seller/mine — seller's own products
 */
const listMyProducts = asyncHandler(async (req, res) => {
  const seller = await assertSellerCanSell(req.user.id);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await Product.findAll({
    sellerId: seller.id,
    status: req.query.status || null,
    page,
    limit,
    sort: req.query.sort || 'newest',
  });

  res.json({
    success: true,
    message: 'Seller products retrieved',
    data: result,
  });
});

/**
 * POST /api/products — seller (own profile) or admin (must pass sellerId)
 */
const createProduct = asyncHandler(async (req, res) => {
  let seller;

  if (req.user.role === 'admin') {
    if (!req.body.sellerId) {
      throw new AppError('sellerId is required when an admin creates a product', 400);
    }
    seller = await Seller.findById(req.body.sellerId);
    if (!seller) {
      throw new AppError('Seller not found', 404);
    }
    if (seller.verification_status === 'deactivated') {
      throw new AppError('Cannot add products for a deactivated seller', 400);
    }
  } else {
    seller = await assertSellerCanSell(req.user.id);
  }

  const {
    name,
    description,
    price,
    stockQuantity,
    stock_quantity: stockQuantitySnake,
    categoryId,
    category_id: categoryIdSnake,
    location,
    images,
    status,
  } = req.body;

  const resolvedStock =
    stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== ''
      ? Number(stockQuantity)
      : stockQuantitySnake !== undefined && stockQuantitySnake !== null && stockQuantitySnake !== ''
        ? Number(stockQuantitySnake)
        : 0;

  const resolvedCategory = categoryId || categoryIdSnake || null;

  const product = await Product.create({
    seller_id: seller.id,
    category_id: resolvedCategory,
    name: String(name).trim(),
    description: description || null,
    price: Number(price),
    stock_quantity: Number.isFinite(resolvedStock) ? resolvedStock : 0,
    images: Array.isArray(images) ? images : [],
    location: location || seller.business_location || null,
    status: status || 'active',
  });

  res.status(201).json({
    success: true,
    message: 'Product created',
    data: { product },
  });
});

/**
 * PUT /api/products/:id — seller (own) or admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.status === 'deleted') {
    throw new AppError('Product not found', 404);
  }

  if (req.user.role === 'seller') {
    const seller = await assertSellerCanSell(req.user.id);
    if (product.seller_id !== seller.id) {
      throw new AppError('You can only update your own products', 403);
    }
  } else if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.description !== undefined) updates.description = req.body.description || null;
  if (req.body.price !== undefined) updates.price = Number(req.body.price);
  if (req.body.stockQuantity !== undefined) updates.stock_quantity = Number(req.body.stockQuantity);
  if (req.body.stock_quantity !== undefined) updates.stock_quantity = Number(req.body.stock_quantity);
  if (req.body.categoryId !== undefined) updates.category_id = req.body.categoryId || null;
  if (req.body.category_id !== undefined) updates.category_id = req.body.category_id || null;
  if (req.body.location !== undefined) updates.location = req.body.location || null;
  if (req.body.images !== undefined) updates.images = Array.isArray(req.body.images) ? req.body.images : [];
  if (req.body.status !== undefined) updates.status = req.body.status;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const updated = await Product.updateById(req.params.id, updates);

  res.json({
    success: true,
    message: 'Product updated',
    data: { product: updated },
  });
});

/**
 * DELETE /api/products/:id — soft delete
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.status === 'deleted') {
    throw new AppError('Product not found', 404);
  }

  if (req.user.role === 'seller') {
    const seller = await assertSellerCanSell(req.user.id);
    if (product.seller_id !== seller.id) {
      throw new AppError('You can only delete your own products', 403);
    }
  } else if (req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  const deleted = await Product.softDelete(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted',
    data: { product: deleted },
  });
});

module.exports = {
  listProducts,
  getProduct,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
