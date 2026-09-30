const express = require('express');
const {
  createComplaint,
  listMyComplaints,
  getComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createComplaintRules,
  idParam,
  paginationRules,
} = require('../validators/adminValidators');

const router = express.Router();

router.use(protect);

router.post('/', createComplaintRules, validate, createComplaint);
router.get('/mine', paginationRules, validate, listMyComplaints);
router.get('/:id', idParam, validate, getComplaint);

module.exports = router;
