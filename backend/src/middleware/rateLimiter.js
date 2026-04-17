// Purpose: Rate limiter middleware — general and loan-specific limits
'use strict';

const rateLimit = require('express-rate-limit');

/**
 * generalLimiter — 100 requests per 15 minutes per IP.
 * Applied to all routes as global middleware.
 */
const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders:  true,
  legacyHeaders:    false,
  handler: (req, res) => {
    res.status(429).json({
      success:    false,
      error:      'RATE_LIMITED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * loanApiLimiter — 20 requests per 15 minutes per IP.
 * Applied to /api/v1/agent/* routes (stricter — prevents abuse of agent pipeline).
 */
const loanApiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler: (req, res) => {
    res.status(429).json({
      success:    false,
      error:      'RATE_LIMITED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = { generalLimiter, loanApiLimiter };
