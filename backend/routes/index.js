const express = require('express');
const { getModelStatus } = require('../controllers/modelStatusController');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');
const sellerRoutes = require('./sellerRoutes');
const complaintRoutes = require('./complaintRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SS Marketplace API is running',
    data: {
      phase: 12,
      stack: {
        backend: 'Node.js + Express',
        database: 'Supabase (PostgreSQL)',
        auth: 'JWT + bcrypt + RBAC',
        payments: 'M-Pesa Daraja + mock mode',
      },
      endpoints: {
        health: '/health',
        modelStatus: '/api/models/status',
        auth: '/api/auth',
        users: '/api/users',
        categories: '/api/categories',
        products: '/api/products',
        cart: '/api/cart',
        orders: '/api/orders',
        payments: '/api/payments',
        reviews: '/api/reviews',
        messages: '/api/messages',
        notifications: '/api/notifications',
        admin: '/api/admin',
        seller: '/api/seller',
        complaints: '/api/complaints',
        uploads: '/api/uploads',
      },
    },
  });
});

router.get('/models/status', getModelStatus);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/seller', sellerRoutes);
router.use('/complaints', complaintRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
