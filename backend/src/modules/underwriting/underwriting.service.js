// Purpose: SKILL-001 — Pure underwriting function — no DB, no side-effects, fully testable
'use strict';

const { ApplicantSchema } = require('./underwriting.schema');

/**
 * evaluateLoanEligibility — Core underwriting engine.
 * Applies rules in strict order (first match wins for REJECT/MANUAL_REVIEW).
 *
 * Rules:
 *   R001: creditScore < 700        → REJECT
 *   R002: monthlyIncome < 15000    → REJECT
 *   R003: existingEMI/income > 50% → REJECT
 *   R004: requestedAmount > income*10 → MANUAL_REVIEW
 *   R005: score 700-749 + EMI/income > 40% → MANUAL_REVIEW
 *   R006: all pass → APPROVE
 *
 * @param {object} applicantData — validated by ApplicantSchema
 * @returns {{ decision: string, reasonCode: string|null, reasonMessage: string|null, eligibleAmount: number|null }}
 */
function evaluateLoanEligibility(applicantData) {
  // Validate inputs first — Zod will throw on bad data
  const parsed = ApplicantSchema.parse(applicantData);
  const { creditScore, monthlyIncome, requestedAmount, existingEMI } = parsed;

  const emiRatio = monthlyIncome > 0 ? existingEMI / monthlyIncome : Infinity;

  // ── R001: Credit Score threshold ────────────────────────────────────────
  if (creditScore < 700) {
    return {
      decision:      'REJECT',
      reasonCode:    'R001',
      reasonMessage: 'Credit score below minimum threshold of 700.',
      eligibleAmount: null,
    };
  }

  // ── R002: Minimum income ─────────────────────────────────────────────────
  if (monthlyIncome < 15000) {
    return {
      decision:      'REJECT',
      reasonCode:    'R002',
      reasonMessage: 'Monthly income below minimum requirement of ₹15,000.',
      eligibleAmount: null,
    };
  }

  // ── R003: Existing EMI > 50% of salary ──────────────────────────────────
  if (emiRatio > 0.50) {
    return {
      decision:      'REJECT',
      reasonCode:    'R003',
      reasonMessage: 'Existing EMI obligations exceed 50% of monthly salary.',
      eligibleAmount: null,
    };
  }

  // ── R004: Loan amount > 10× income ──────────────────────────────────────
  if (requestedAmount > monthlyIncome * 10) {
    return {
      decision:      'MANUAL_REVIEW',
      reasonCode:    'R004',
      reasonMessage: 'Requested amount exceeds 10 times monthly income — requires manual review.',
      eligibleAmount: null,
    };
  }

  // ── R005: Borderline credit score + moderate EMI ─────────────────────────
  if (creditScore >= 700 && creditScore < 750 && emiRatio > 0.40) {
    return {
      decision:      'MANUAL_REVIEW',
      reasonCode:    'R005',
      reasonMessage: 'Borderline credit score with elevated existing obligations — requires manual review.',
      eligibleAmount: null,
    };
  }

  // ── R006: All checks pass — APPROVE ─────────────────────────────────────
  const eligibleAmount = Math.min(requestedAmount, monthlyIncome * 8);
  return {
    decision:      'APPROVE',
    reasonCode:    null,
    reasonMessage: null,
    eligibleAmount,
  };
}

module.exports = { evaluateLoanEligibility };
