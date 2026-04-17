// Purpose: Express app configuration — security middleware, CORS, routes, error handler
'use strict';

const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const morgan   = require('morgan');

const { generalLimiter } = require('./middleware/rateLimiter');
const authRoutes         = require('./routes/auth.routes');
const agentRoutes        = require('./routes/agent.routes');

const app = express();

/* ── Security Headers ────────────────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy:     false, // Frontend handles via meta tags
  crossOriginEmbedderPolicy: true,
}));

/* ── CORS ────────────────────────────────────────────────────────────────── */
app.use(cors({
  origin:           process.env.FRONTEND_URL || 'http://localhost:3000',
  methods:          ['GET', 'POST'],
  allowedHeaders:   ['Content-Type', 'Authorization', 'x-internal-token'],
  credentials:      true,
}));

/* ── Body Parsing ────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── HTTP Logging ────────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

/* ── Global Rate Limit ───────────────────────────────────────────────────── */
app.use(generalLimiter);

/* ── Health Check ────────────────────────────────────────────────────────── */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status:    'ok',
    service:   'TrustFlow Finance API',
    version:   '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* ── API Routes ──────────────────────────────────────────────────────────── */
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/agent', agentRoutes);

/* ── 404 Handler ─────────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` });
});

/* ── Global Error Handler ────────────────────────────────────────────────── */
// Must be LAST middleware — 4 args signature is required by Express
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[ERROR]', err.message, isProd ? '' : err.stack);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'FILE_TOO_LARGE', message: 'Maximum file size is 5MB' });
  }

  // Multer mime type error
  if (err.message && err.message.includes('Only PDF')) {
    return res.status(400).json({ success: false, error: 'INVALID_MIME', message: err.message });
  }

  res.status(err.status || 500).json({
    success:  false,
    error:    'INTERNAL_ERROR',
    message:  isProd ? 'An internal error occurred' : err.message,
  });
});

module.exports = app;
