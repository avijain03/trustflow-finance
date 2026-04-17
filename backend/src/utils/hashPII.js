// Purpose: SKILL-008 — argon2id PII hasher for PAN, Aadhaar, phone, and passwords
'use strict';

const argon2 = require('argon2');

const ARGON2_OPTIONS = {
  type:        argon2.argon2id,
  timeCost:    3,
  memoryCost:  65536, // 64MB
  parallelism: 1,
};

/**
 * hashPII — Hash sensitive PII with argon2id.
 * Use for: PAN, Aadhaar, phone (when used as lookup key), passwords.
 * argon2id resists side-channel and GPU attacks.
 *
 * @param {string} value — plaintext PII value
 * @returns {Promise<string>} argon2id hash
 */
async function hashPII(value) {
  if (!value || typeof value !== 'string') throw new Error('hashPII: value must be a non-empty string');
  return argon2.hash(value, ARGON2_OPTIONS);
}

/**
 * comparePII — Verify plaintext against stored argon2id hash.
 *
 * @param {string} value — plaintext value
 * @param {string} hash  — stored argon2id hash
 * @returns {Promise<boolean>}
 */
async function comparePII(value, hash) {
  if (!value || !hash) return false;
  return argon2.verify(hash, value);
}

module.exports = { hashPII, comparePII };
