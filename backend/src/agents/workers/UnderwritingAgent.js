// Purpose: UnderwritingAgent — fetches credit score then runs SOA underwriting evaluation
'use strict';

const { evaluateLoanEligibility } = require('../../modules/underwriting/underwriting.service');
const { fetchCreditScore }        = require('../../services/creditBureau.service');
const agentLogRepo                = require('../../repositories/agentLog.repository');

/**
 * execute — Run the full underwriting assessment for an applicant.
 *
 * @param {{ applicantId, pan, monthlyIncome, requestedAmount, employmentType, existingEMI }} payload
 * @returns {Promise<{ decision, reasonCode, reasonMessage, eligibleAmount, creditScore }>}
 */
async function execute(payload) {
  const startTime = Date.now();
  try {
    const { applicantId, pan, monthlyIncome, requestedAmount, employmentType, existingEMI = 0 } = payload;

    // Step 1: Fetch credit score (cache-first)
    const creditReport = await fetchCreditScore(pan);
    const creditScore  = creditReport.creditScore;

    // Step 2: Run pure underwriting evaluation
    const result = evaluateLoanEligibility({
      applicantId,
      creditScore,
      monthlyIncome,
      requestedAmount,
      existingEMI,
      employmentType,
    });

    // Step 3: Audit log
    await agentLogRepo.create({
      sessionId:    applicantId,
      agentName:    'UnderwritingAgent',
      skillUsed:    'SKILL-001 + SKILL-002',
      inputSummary: `employment=${employmentType}, income=${monthlyIncome}, EMI=${existingEMI}`,
      outputSummary:`decision=${result.decision}, code=${result.reasonCode}`,
      durationMs:   Date.now() - startTime,
    });

    return { ...result, creditScore };
  } catch (err) {
    return { success: false, error: err.message, decision: 'ERROR' };
  }
}

module.exports = { execute };
