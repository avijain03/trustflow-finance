// Purpose: SKILL-003 — Document verification with magic byte sniffing and PDF text layer check
'use strict';

const path = require('path');

// Magic byte signatures for allowed file types
const MAGIC_BYTES = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],       // %PDF
  'image/jpeg':      [0xFF, 0xD8, 0xFF],               // JPEG SOI
  'image/png':       [0x89, 0x50, 0x4E, 0x47],         // \x89PNG
};

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_SIZE     = 5 * 1024 * 1024; // 5MB

/**
 * verifyDocument — Full document security verification pipeline.
 *
 * Checks (in order):
 *  E001 — File size ≤ 5MB
 *  E002 — MIME type is allowed
 *  E003 — Magic bytes match declared MIME
 *  E004 — Filename sanitization
 *  E005 — PDF must have readable text layer
 *
 * @param {{ buffer: Buffer, mimetype: string, size: number, originalname: string }} file
 * @param {string} docType — e.g. 'SALARY_SLIP', 'PAN', 'AADHAAR'
 * @returns {{ status: 'VALID'|'INVALID'|'REQUIRES_REUPLOAD', errorCode?: string, sanitizedFilename: string }}
 */
function verifyDocument(file, docType) {
  const { buffer, mimetype, size, originalname } = file;

  // ── E001: Size check ─────────────────────────────────────────────────────
  if (!size || size === 0) {
    return { status: 'INVALID', errorCode: 'E001', sanitizedFilename: _sanitizeFilename(originalname) };
  }
  if (size > MAX_SIZE) {
    return { status: 'INVALID', errorCode: 'E001', sanitizedFilename: _sanitizeFilename(originalname) };
  }

  // ── E002: MIME type allowlist ────────────────────────────────────────────
  if (!ALLOWED_MIME.has(mimetype)) {
    return { status: 'INVALID', errorCode: 'E002', sanitizedFilename: _sanitizeFilename(originalname) };
  }

  // ── E003: Magic byte sniffing ────────────────────────────────────────────
  if (!buffer || buffer.length < 4) {
    return { status: 'INVALID', errorCode: 'E003', sanitizedFilename: _sanitizeFilename(originalname) };
  }

  const expectedBytes = MAGIC_BYTES[mimetype];
  if (!expectedBytes) {
    return { status: 'INVALID', errorCode: 'E003', sanitizedFilename: _sanitizeFilename(originalname) };
  }

  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) {
      return { status: 'INVALID', errorCode: 'E003', sanitizedFilename: _sanitizeFilename(originalname) };
    }
  }

  // ── E004: Sanitize filename ──────────────────────────────────────────────
  const sanitizedFilename = _sanitizeFilename(originalname);

  // ── E005: PDF must have readable text layer ──────────────────────────────
  if (mimetype === 'application/pdf') {
    const content = buffer.toString('binary');
    const hasTextLayer = content.includes('BT') || content.includes('/Text');
    if (!hasTextLayer) {
      return { status: 'REQUIRES_REUPLOAD', errorCode: 'E005', sanitizedFilename };
    }
  }

  return { status: 'VALID', sanitizedFilename, docType };
}

/**
 * _sanitizeFilename — Remove path traversal, special chars, replace spaces with underscores.
 * NEVER rejects based on filename — only sanitizes.
 * '../../../etc/passwd.pdf' → '______etc_passwd.pdf'
 */
function _sanitizeFilename(filename) {
  if (!filename) return 'document.bin';
  return filename
    .replace(/[/\\]/g,  '_')  // path separators → underscore
    .replace(/\.\./g,   '_')  // traversal dots → underscore
    .replace(/[<>:"?*|]/g, '_') // special chars
    .replace(/\s+/g,    '_')   // spaces → underscore
    .replace(/[^\w._-]/g, '_') // anything else non-word
    .slice(0, 100);             // max 100 chars
}

module.exports = { verifyDocument, _sanitizeFilename };
