// Purpose: DocumentVerificationAgent — verifies uploads and persists to LoanApplication
'use strict';

const { verifyDocument }  = require('../../services/documentVerify.service');
const loanRepo             = require('../../repositories/loanApplication.repository');
const agentLogRepo         = require('../../repositories/agentLog.repository');

/**
 * execute — Run security verification on uploaded file and append to application.
 *
 * @param {{ file, docType, applicationId }} payload
 * @returns {Promise<{ status, errorCode?, sanitizedFilename, docType }>}
 */
async function execute({ file, docType, applicationId }) {
  const startTime = Date.now();
  try {
    const result = verifyDocument(file, docType);

    // Append document record to LoanApplication if applicationId provided
    if (applicationId) {
      await loanRepo.appendDocument(applicationId, {
        docType,
        sanitizedFilename: result.sanitizedFilename,
        verifyStatus:      result.status === 'VALID' ? 'VALID' :
                           result.status === 'REQUIRES_REUPLOAD' ? 'REQUIRES_REUPLOAD' : 'INVALID',
      });
    }

    await agentLogRepo.create({
      sessionId:    applicationId || 'no-app-id',
      agentName:    'DocumentVerificationAgent',
      skillUsed:    'SKILL-003',
      inputSummary: `docType=${docType}, size=${file.size}B`,
      outputSummary:`status=${result.status}, code=${result.errorCode || 'none'}`,
      durationMs:   Date.now() - startTime,
    });

    return result;
  } catch (err) {
    return { success: false, error: err.message, status: 'ERROR' };
  }
}

module.exports = { execute };
