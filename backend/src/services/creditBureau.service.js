// Purpose: SKILL-002 — Credit bureau service with 24h cache and deterministic mock fallback
'use strict';

const CreditCache = require('../models/CreditCache.model');
const { hashPII }  = require('../utils/hashPII');

/**
 * fetchCreditScore — Fetch credit score for a given PAN.
 * Flow: hash PAN → check cache → API call → deterministic mock fallback → cache result
 *
 * @param {string} pan — raw PAN number
 * @returns {Promise<{ creditScore: number, repaymentHistory: string, activeLoanCount: number, panHash: string }>}
 */
async function fetchCreditScore(pan) {
  if (!pan) throw new Error('[CreditBureau] PAN is required');

  const panHash = await hashPII(pan);

  // ── 1. Cache check ───────────────────────────────────────────────────────
  const cached = await CreditCache.findOne({ panHash });
  if (cached) {
    console.log('[CreditBureau] Cache hit');
    return {
      creditScore:       cached.creditScore,
      repaymentHistory:  cached.reportData?.repaymentHistory  || 'GOOD',
      activeLoanCount:   cached.reportData?.activeLoanCount   || 0,
      panHash,
      fromCache: true,
    };
  }

  // ── 2. API call (if configured) ──────────────────────────────────────────
  let score;
  let reportData = {};

  if (process.env.CREDIT_BUREAU_API_URL && !process.env.CREDIT_BUREAU_API_URL.includes('mock')) {
    try {
      const axios = require('axios');
      const resp  = await axios.post(
        `${process.env.CREDIT_BUREAU_API_URL}/score`,
        { pan },
        { headers: { 'x-api-key': process.env.CREDIT_BUREAU_API_KEY }, timeout: 5000 }
      );
      score      = resp.data.creditScore;
      reportData = resp.data;
    } catch (err) {
      console.warn('[CreditBureau] API call failed, using mock:', err.message);
      score = _deterministicMockScore(pan);
    }
  } else {
    // ── 3. Deterministic mock (dev / no API key) ─────────────────────────
    score = _deterministicMockScore(pan);
    reportData = {
      repaymentHistory: score >= 750 ? 'EXCELLENT' : score >= 700 ? 'GOOD' : 'FAIR',
      activeLoanCount:  Math.floor(pan.charCodeAt(3) % 4),
    };
  }

  // ── 4. Cache the result ──────────────────────────────────────────────────
  await CreditCache.findOneAndUpdate(
    { panHash },
    { panHash, creditScore: score, reportData, cachedAt: new Date() },
    { upsert: true, new: true }
  );

  return {
    creditScore:      score,
    repaymentHistory: reportData.repaymentHistory || 'GOOD',
    activeLoanCount:  reportData.activeLoanCount  || 0,
    panHash,
    fromCache: false,
  };
}

/**
 * _deterministicMockScore — Always returns the same score for the same PAN.
 * Range: 600-900 based on first char ASCII code.
 */
function _deterministicMockScore(pan) {
  return (pan.charCodeAt(0) % 300) + 600;
}

module.exports = { fetchCreditScore };
