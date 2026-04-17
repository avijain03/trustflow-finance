// Purpose: ComplianceAgent — adapter around compliance.service for KYC and watchlist checks
'use strict';

const { runComplianceCheck } = require('../../services/compliance.service');

/**
 * execute — Run compliance check after underwriting APPROVE.
 * @param {{ applicantId, kycDocs }} payload
 */
async function execute({ applicantId, kycDocs = [] }) {
  try {
    return await runComplianceCheck(applicantId, kycDocs);
  } catch (err) {
    return { success: false, error: err.message, status: 'ERROR' };
  }
}

module.exports = { execute };
