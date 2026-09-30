const Category = require('../models/Category');
const { AppError } = require('../middleware/errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/categories
 */
const listCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const status = req.query.status || 'active';

  const result = await Category.findAll({ status, page, limit });

  res.json({
    success: true,
    message: 'Categories retrieved',
    data: result,
  });
});

/**
 * GET /api/categories/:id
 */
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  res.json({
    success: true,
    message: 'Category retrieved',
    data: { category },
  });
});

/**
 * POST /api/categories — admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, status } = req.body;

  const existing = await Category.findByName(name.trim());
  if (existing) throw new AppError('A category with this name already exists', 409);

  const category = await Category.create({
    name: name.trim(),
    description: description || null,
    image: image || null,
    status: status || 'active',
  });

  res.status(201).json({
    success: true,
    message: 'Category created',
    data: { category },
  });
});

/**
 * PUT /api/categories/:id — admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) throw new AppError('Category not found', 404);

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.description !== undefined) updates.description = req.body.description || null;
  if (req.body.image !== undefined) updates.image = req.body.image || null;
  if (req.body.status !== undefined) updates.status = req.body.status;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const category = await Category.updateById(req.params.id, updates);

  res.json({
    success: true,
    message: 'Category updated',
    data: { category },
  });
});

/**
 * DELETE /api/categories/:id — admin (soft)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) throw new AppError('Category not found', 404);

  const category = await Category.deleteById(req.params.id);

  res.json({
    success: true,
    message: 'Category deactivated',
    data: { category },
  });
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
