// Purpose: SKILL-006 — Compliance service: KYC check, mock watchlist, audit logging
'use strict';

const agentLogRepo = require('../repositories/agentLog.repository');

/**
 * runComplianceCheck — Validate KYC completeness and watchlist status.
 *
 * Rules:
 *  - KYC: both 'AADHAAR' and 'PAN' must be in kycDocs array
 *  - Watchlist: applicantId ending in '999' → BLOCKED (mock)
 *  - All checks logged to AgentLog
 *
 * @param {string} applicantId
 * @param {string[]} kycDocs — array of uploaded doc types e.g. ['AADHAAR', 'PAN', 'SALARY_SLIP']
 * @returns {Promise<{ status: 'CLEAR'|'KYC_INCOMPLETE'|'BLOCKED', reason?: string }>}
 */
async function runComplianceCheck(applicantId, kycDocs = []) {
  const startTime = Date.now();

  let status, reason;

  // ── Watchlist check (mock) ───────────────────────────────────────────────
  if (applicantId && applicantId.endsWith('999')) {
    status = 'BLOCKED';
    reason = 'Applicant flagged on sanctions watchlist';
  }

  // ── KYC completeness ─────────────────────────────────────────────────────
  else if (!kycDocs.includes('AADHAAR') || !kycDocs.includes('PAN')) {
    const missing = [];
    if (!kycDocs.includes('AADHAAR')) missing.push('Aadhaar');
    if (!kycDocs.includes('PAN'))     missing.push('PAN');
    status = 'KYC_INCOMPLETE';
    reason = `Missing required KYC documents: ${missing.join(', ')}`;
  }

  else {
    status = 'CLEAR';
  }

  // ── Audit log ────────────────────────────────────────────────────────────
  await agentLogRepo.create({
    sessionId:     applicantId,
    agentName:      'ComplianceAgent',
    skillUsed:      'SKILL-006',
    inputSummary:   `Applicant: [ID_REDACTED], docs: ${kycDocs.length} items`,
    outputSummary:  `status=${status}${reason ? ', reason=' + reason : ''}`,
    durationMs:     Date.now() - startTime,
    brandVersion:   'TrustFlow-v2',
  });

  return { status, reason };
}

module.exports = { runComplianceCheck };
