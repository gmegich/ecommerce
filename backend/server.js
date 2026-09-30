require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { testSupabaseConnection } = require('./config/supabase');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5001;

/* ---------- Security & parsing ---------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ---------- Static uploads ---------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------- Routes ---------- */
app.use('/api', indexRoutes);

/* Health check (also useful for uptime monitors) */
app.get('/health', async (req, res) => {
  const db = await testSupabaseConnection();
  res.status(db.ok ? 200 : 503).json({
    success: db.ok,
    message: db.ok ? 'Server healthy' : 'Server up but database unreachable',
    data: {
      database: db.message,
      timestamp: new Date().toISOString(),
    },
  });
});

/* ---------- Error handling ---------- */
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  const db = await testSupabaseConnection();
  console.log(`[Database] ${db.message}`);

  const server = app.listen(PORT, () => {
    console.log(`SS Marketplace API listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`API root: http://localhost:${PORT}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[Server] Port ${PORT} is already in use. Change PORT in backend/.env`
      );
      process.exit(1);
    }
    throw err;
  });
};

startServer();

module.exports = app;
