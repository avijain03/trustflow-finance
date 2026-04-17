// Purpose: User auth middleware — verifies JWT from Authorization header
'use strict';

const { verifyJWT } = require('../utils/jwt');

/**
 * authMiddleware — Validates Bearer token in Authorization header.
 * Attaches decoded payload to req.user on success.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }
}

module.exports = authMiddleware;
