const express = require('express');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createCategoryRules,
  updateCategoryRules,
  idParam,
} = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', listCategories);
router.get('/:id', idParam, validate, getCategory);

router.post('/', protect, authorize('admin'), createCategoryRules, validate, createCategory);
router.put('/:id', protect, authorize('admin'), updateCategoryRules, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), idParam, validate, deleteCategory);

module.exports = router;
