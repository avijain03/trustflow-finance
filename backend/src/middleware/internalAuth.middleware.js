// Purpose: Internal agent auth middleware — verifies short-lived tokens on all worker routes
'use strict';

const { verifyInternalJWT } = require('../utils/jwt');

/**
 * internalAuthMiddleware — Validates tokens signed by MasterAgent (INTERNAL_JWT_SECRET, 60s TTL).
 * Applied to ALL /api/v1/agent/workers/* routes.
 * Worker routes must NEVER be callable without a valid internal token.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function internalAuthMiddleware(req, res, next) {
  const authHeader = req.headers['x-internal-token'];

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'INTERNAL_AUTH_FAILED' });
  }

  try {
    const decoded = verifyInternalJWT(authHeader);
    req.internalClaims = decoded; // { masterId, reqId, iat, exp }
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'INTERNAL_AUTH_FAILED' });
  }
}

module.exports = internalAuthMiddleware;
