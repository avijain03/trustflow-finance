// Purpose: CreditBureauAgent — thin adapter around creditBureau.service
'use strict';

const { fetchCreditScore } = require('../../services/creditBureau.service');

/**
 * execute — Fetch credit score for a given PAN.
 * @param {{ pan: string }} payload
 */
async function execute({ pan }) {
  try {
    return await fetchCreditScore(pan);
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { execute };
