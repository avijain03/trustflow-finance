// Purpose: Centralised environment variable loader — strict in production, lenient in dev
'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const REQUIRED_PROD = [
  'MONGODB_URI',
  'JWT_SECRET',
  'INTERNAL_JWT_SECRET',
  'FRONTEND_URL',
];

const DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  JWT_EXPIRY: '7d',
  INTERNAL_JWT_EXPIRY: '60',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '100',
};

/**
 * getEnv — Resolve an env variable with optional default.
 * Throws if the variable is missing in production.
 *
 * @param {string} key
 * @param {string} [fallback]
 * @returns {string}
 */
function getEnv(key, fallback) {
  const value = process.env[key] || fallback || DEFAULTS[key];
  const isProd = process.env.NODE_ENV === 'production';

  if (!value && isProd && REQUIRED_PROD.includes(key)) {
    throw new Error(`[ENV] Missing required production env var: ${key}`);
  }

  return value || '';
}

/**
 * validateEnv — Run at startup to ensure critical vars are present.
 * Throws in production, warns in development.
 */
function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const missing = [];

  for (const key of REQUIRED_PROD) {
    const val = process.env[key];
    if (!val || val.startsWith('your_') || val === 'placeholder') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg = `[ENV] Missing or placeholder env vars: ${missing.join(', ')}`;
    if (isProd) throw new Error(msg);
    else console.warn(`[ENV] ⚠️  ${msg} — OK in dev mode`);
  }
}

module.exports = { getEnv, validateEnv };
