const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  updateProfileRules,
  changePasswordRules,
} = require('../validators/authValidators');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileRules, validate, updateProfile);
router.put('/password', changePasswordRules, validate, changePassword);

module.exports = router;
