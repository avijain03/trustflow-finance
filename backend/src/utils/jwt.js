// Purpose: SKILL-009 — JWT utilities for user auth and internal agent-to-agent tokens
'use strict';

const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

/**
 * generateJWT — Sign a user-facing token with JWT_SECRET.
 * @param {object} payload
 * @returns {string} signed JWT
 */
function generateJWT(payload) {
  return jwt.sign(payload, getEnv('JWT_SECRET'), {
    expiresIn: getEnv('JWT_EXPIRY', '7d'),
  });
}

/**
 * verifyJWT — Verify and decode a user JWT.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} if token invalid / expired
 */
function verifyJWT(token) {
  return jwt.verify(token, getEnv('JWT_SECRET'));
}

/**
 * generateInternalJWT — MasterAgent signs this before calling any worker.
 * Short-lived (60s) and signed with a SEPARATE secret.
 * @param {object} payload — typically { masterId, reqId, timestamp }
 * @returns {string} signed internal JWT
 */
function generateInternalJWT(payload) {
  const expiry = parseInt(getEnv('INTERNAL_JWT_EXPIRY', '60'), 10);
  return jwt.sign(payload, getEnv('INTERNAL_JWT_SECRET'), { expiresIn: expiry });
}

/**
 * verifyInternalJWT — Workers call this to validate MasterAgent tokens.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {Error} if token invalid / expired
 */
function verifyInternalJWT(token) {
  return jwt.verify(token, getEnv('INTERNAL_JWT_SECRET'));
}

module.exports = { generateJWT, verifyJWT, generateInternalJWT, verifyInternalJWT };
