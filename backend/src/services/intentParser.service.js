// Purpose: SKILL-007 — Intent parser for chat messages including Hinglish and TrustFlow brand triggers
'use strict';

const INTENT_MAP = {
  GREETING: [
    'hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good afternoon',
    'good evening', 'start', 'begin', 'trustflow', 'help', 'kya hal hai', 'kaise ho',
    'sup', 'hola',
  ],
  LOAN_ENQUIRY: [
    'loan', 'apply', 'eligibility', 'eligible', 'qualify', 'amount', 'lend', 'borrow',
    'home loan', 'personal loan', 'business loan', 'credit', 'finance', 'fund',
    'paisa chahiye', 'loan chahiye', 'loan lena', 'loan ke liye', 'apply karna',
    'apply for', 'need a loan', 'want a loan', 'get a loan', 'take a loan',
  ],
  APPLICATION_STATUS: [
    'status', 'application status', 'check status', 'my application', 'track',
    'approved', 'rejected', 'pending', 'update', 'where is my', 'what happened to',
    'mera application', 'application ka status', 'kya hua', 'abhi tak', 'kitna time',
  ],
  DOCUMENT_UPLOAD: [
    'document', 'upload', 'attach', 'salary slip', 'pay slip', 'bank statement',
    'aadhaar', 'aadhar', 'pan card', 'itr', 'income proof', 'kyc', 'verification',
    'doc', 'file', 'submit', 'daakhil', 'document upload karna',
  ],
  EMI_CALCULATOR: [
    'emi', 'calculate', 'monthly', 'instalment', 'installment', 'per month', 'interest',
    'repayment', 'how much', 'kitna', 'kitni', 'calculator', 'math', 'compute',
    'emi kya hogi', 'emi kitni hogi', 'monthly payment',
  ],
};

/**
 * parseUserIntent — Classify a chat message into one of the defined intents.
 *
 * @param {string} message — sanitised user input
 * @returns {'GREETING'|'LOAN_ENQUIRY'|'APPLICATION_STATUS'|'DOCUMENT_UPLOAD'|'EMI_CALCULATOR'|'UNKNOWN'}
 */
function parseUserIntent(message) {
  if (!message || typeof message !== 'string') return 'UNKNOWN';
  const lower = message.toLowerCase();

  for (const [intent, keywords] of Object.entries(INTENT_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return intent;
    }
  }

  return 'UNKNOWN';
}

module.exports = { parseUserIntent };
