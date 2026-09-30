const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * POST /api/uploads/images
 * Accepts multipart field "images" (up to 5) or "image" (single).
 * Returns local URLs that can be stored on products.
 */
router.post(
  '/images',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  asyncHandler(async (req, res) => {
    const files = [
      ...(req.files?.image || []),
      ...(req.files?.images || []),
    ];

    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded. Use field "image" or "images".',
      });
    }

    const base = `${req.protocol}://${req.get('host')}/uploads`;
    const urls = files.map((f) => `${base}/${f.filename}`);

    res.status(201).json({
      success: true,
      message: 'Images uploaded',
      data: {
        urls,
        url: urls[0],
      },
    });
  })
);

module.exports = router;
