const express = require('express');
const admin = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  updateComplaintRules,
  updateUserStatusRules,
  sellerActionRules,
  paginationRules,
} = require('../validators/adminValidators');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', admin.getDashboard);
router.get('/reports', admin.getReports);

router.get('/users', paginationRules, validate, admin.listUsers);
router.put('/users/:id/status', updateUserStatusRules, validate, admin.updateUserStatus);

router.get('/sellers', paginationRules, validate, admin.listSellers);
router.put('/sellers/:id/approve', sellerActionRules, validate, admin.approveSeller);
router.put('/sellers/:id/deactivate', sellerActionRules, validate, admin.deactivateSeller);
router.put('/sellers/:id/reject', sellerActionRules, validate, admin.rejectSeller);

router.get('/products', paginationRules, validate, admin.listProducts);
router.get('/orders', paginationRules, validate, admin.listOrders);
router.get('/categories', paginationRules, validate, admin.listCategories);
router.get('/payments', paginationRules, validate, admin.listPayments);

router.get('/complaints', paginationRules, validate, admin.listComplaints);
router.put('/complaints/:id', updateComplaintRules, validate, admin.updateComplaint);

module.exports = router;
