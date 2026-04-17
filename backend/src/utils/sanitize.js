// Purpose: SKILL-010 — Input sanitizer for chat messages — strips injections, preserves ₹ symbol
'use strict';

/**
 * sanitizeChatInput — Clean user chat input before passing to any agent.
 *
 * Rules (applied in order):
 *  1. Strip HTML/script tags
 *  2. Strip javascript: URIs
 *  3. Strip SQL injection fragments
 *  4. Strip MongoDB $ operators (but NOT the ₹ rupee sign — critical for fintech)
 *  5. Truncate to 2000 characters
 *
 * @param {string} raw — raw user input
 * @returns {string} cleaned input
 */
function sanitizeChatInput(raw) {
  if (typeof raw !== 'string') return '';

  let clean = raw;

  // 1. Strip HTML tags (including <script>, <img>, etc.)
  clean = clean.replace(/<[^>]*>/gi, '');

  // 2. Strip javascript: URIs
  clean = clean.replace(/javascript\s*:/gi, '');

  // 3. Strip SQL injection patterns
  clean = clean.replace(/\bOR\s+1\s*=\s*1\b/gi, '');
  clean = clean.replace(/\bDROP\s+TABLE\b/gi, '');
  clean = clean.replace(/\bUNION\s+SELECT\b/gi, '');
  clean = clean.replace(/;\s*--/g, '');

  // 4. Strip MongoDB $operators — but NOT ₹ (U+20B9) or $ in "₹$" context
  //    Strategy: replace $ only when followed by a letter (MongoDB operator pattern)
  //    This preserves "$500" text BUT more importantly preserves ₹ entirely as it's a different char.
  //    The ₹ symbol is Unicode U+20B9 — completely distinct from ASCII $ (U+0024).
  clean = clean.replace(/\$(?=[a-zA-Z])/g, '');

  // 5. Truncate to 2000 characters
  if (clean.length > 2000) {
    clean = clean.slice(0, 2000);
  }

  return clean.trim();
}

module.exports = { sanitizeChatInput };
