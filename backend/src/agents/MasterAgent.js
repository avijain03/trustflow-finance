// Purpose: MasterAgent — orchestrates all worker agents, handles intents, applies brand response
'use strict';

const { v4: uuidv4 }              = require('uuid');
const { sanitizeChatInput }       = require('../utils/sanitize');
const { parseUserIntent }         = require('../services/intentParser.service');
const { generateInternalJWT }     = require('../utils/jwt');
const { formatINR }               = require('../services/brandResponse.service');
const chatSessionRepo             = require('../repositories/chatSession.repository');
const agentLogRepo                = require('../repositories/agentLog.repository');

const CRMAgent             = require('./workers/CRMAgent');
const UnderwritingAgent    = require('./workers/UnderwritingAgent');
const ComplianceAgent      = require('./workers/ComplianceAgent');
const BrandResponseAgent   = require('./workers/BrandResponseAgent');

/**
 * execute — Main orchestration entry point called by POST /api/v1/agent/master
 *
 * @param {{ message: string, sessionId: string, userId: string }} params
 * @returns {Promise<BrandedResponse>}
 */
async function execute({ message, sessionId, userId }) {
  const masterStart = Date.now();
  const agentUsed   = ['MasterAgent'];

  try {
    // ── Step 1: Sanitize input ────────────────────────────────────────────
    const cleanMessage = sanitizeChatInput(message);

    // ── Step 2: Parse intent ──────────────────────────────────────────────
    const { intent, answer } = await parseUserIntent(cleanMessage);

    // ── Step 3: Generate internal token for worker calls ─────────────────
    const internalToken = generateInternalJWT({
      masterId: 'master-agent',
      reqId:    uuidv4(),
    });

    // ── Step 4: CRM lookup — always first ────────────────────────────────
    let customer = null;
    try {
      const crmResult = await CRMAgent.execute({ phone: null }); // phone resolved via session
      customer = crmResult.customer;
      agentUsed.push('CRMAgent');
    } catch { /* CRM failure is non-fatal */ }

    // ── Step 5: Ensure session exists ─────────────────────────────────────
    let session = await chatSessionRepo.findBySessionId(sessionId);
    if (!session) {
      session = await chatSessionRepo.create({ sessionId, userId: userId || null, messages: [] });
    }

    // ── Step 6: Route by intent ───────────────────────────────────────────
    let rawReply     = '';
    let decision     = null;
    let eligibleAmount = null;
    let uiProps      = {};

    switch (intent) {

      case 'GREETING': {
        rawReply = `Hello! Welcome to TrustFlow Finance. 🏦\n\nI'm your AI lending assistant, here to help you with:\n• Loan eligibility checks\n• EMI calculations\n• Document verification\n• Application status\n\nHow can I assist you today?`;
        uiProps  = { userName: customer?.name || 'there' };
        agentUsed.push('BrandResponseAgent');
        break;
      }

      case 'LOAN_ENQUIRY': {
        // For a full enquiry, we need applicant data — prompt for it or use seeded data
        const applicantPhone = _extractPhone(cleanMessage);
        let applicant = customer;

        if (!applicant && applicantPhone) {
          const res = await CRMAgent.execute({ phone: applicantPhone });
          applicant  = res.customer;
        }

        const extracted = _extractLoanDetails(cleanMessage);
        const monthlyIncome = applicant ? applicant.monthlyIncome : extracted.income;
        const employmentType = applicant ? applicant.employmentType : extracted.employment;
        const existingEMI = applicant ? applicant.existingEMI : extracted.emi;
        const requestedAmount = extracted.amount || (monthlyIncome ? monthlyIncome * 6 : null);

        if (!applicant && (!monthlyIncome || !employmentType)) {
          rawReply = `To check your loan eligibility, I'll need a few details:\n\n• Your monthly income\n• Employment type (Salaried / Self-Employed / Contract)\n• Existing EMI obligations\n• Desired loan amount\n\nPlease share these or provide your registered phone number.`;
          break;
        }

        const uwResult = await UnderwritingAgent.execute({
          applicantId:     applicant ? applicant.customerId : uuidv4(),
          pan:             'MOCK_PAN', // In production, retrieved from secure store
          monthlyIncome,
          requestedAmount,
          employmentType,
          existingEMI,
        });
        agentUsed.push('UnderwritingAgent');
        decision       = uwResult.decision;
        eligibleAmount = uwResult.eligibleAmount;

        // If APPROVE → run compliance (only if it's a registered user)
        if (decision === 'APPROVE' && applicant) {
          const compliance = await ComplianceAgent.execute({
            applicantId: applicant.customerId,
            kycDocs:     applicant.kycStatus === 'COMPLETE' ? ['AADHAAR', 'PAN'] : [],
          });
          agentUsed.push('ComplianceAgent');
          if (compliance.status === 'BLOCKED') decision = 'REJECT';
          if (compliance.status === 'KYC_INCOMPLETE') decision = 'MANUAL_REVIEW';
        }

        rawReply = _buildLoanReply(decision, eligibleAmount, uwResult);
        uiProps  = {
          decision,
          reasonCode:    uwResult.reasonCode,
          reasonMessage: uwResult.reasonMessage,
          eligibleAmount,
          creditScore:   uwResult.creditScore,
        };
        break;
      }

      case 'APPLICATION_STATUS': {
        rawReply = `To look up your application status, please provide your registered mobile number.`;
        break;
      }

      case 'DOCUMENT_UPLOAD': {
        rawReply = `To upload your documents, please use the 📎 paperclip icon below. Accepted formats:\n\n• Salary Slip (last 3 months)\n• Bank Statement (last 6 months)\n• Aadhaar Card\n• PAN Card\n• ITR (for self-employed)\n\nAll files must be PDF, JPEG, or PNG (max 5MB each).`;
        break;
      }

      case 'EMI_CALCULATOR': {
        const emiResult = _calculateEMI(cleanMessage);
        if (emiResult) {
          const { principal, rate, tenure, emi, totalInterest, totalPayable } = emiResult;
          rawReply = `📊 EMI Calculation\n\n• Loan Amount: ${formatINR(principal)}\n• Interest Rate: ${rate}% per annum\n• Tenure: ${tenure} months\n• Monthly EMI: **${formatINR(emi)}**\n• Total Interest: ${formatINR(totalInterest)}\n• Total Payable: ${formatINR(totalPayable)}\n\nWould you like to apply for this loan? Just say "apply" to start.`;
          uiProps = { principal, interestRate: rate, tenure, monthlyEMI: emi, totalInterest, totalPayable };
        } else {
          rawReply = `To calculate your EMI, please share:\n\n• Loan Amount (e.g., "2 lakh" or "₹2,00,000")\n• Interest Rate (e.g., "12%")\n• Tenure in months (e.g., "24 months")\n\nExample: "EMI for 5 lakh at 10.5% for 36 months"`;
        }
        break;
      }

      case 'GENERAL_QUERY': {
        rawReply = answer || `I can help with general finance and loan queries. How can I assist you?`;
        agentUsed.push('LLMAgent');
        break;
      }

      default: {
        if (answer) {
          rawReply = answer;
        } else {
          rawReply = `I'm here to help with TrustFlow Finance services:\n\n• 💰 **Loan Eligibility** — Check if you qualify\n• 📱 **EMI Calculator** — Calculate monthly payments\n• 📄 **Document Upload** — Submit your KYC docs\n• 🔍 **Application Status** — Track your loan\n\nHow can I assist you?`;
        }
      }
    }

    // ── Step 7: BrandResponseAgent (in-process, always last) ──────────────
    const branded = BrandResponseAgent.execute({
      rawReply, agentUsed, intent, decision, eligibleAmount, uiProps,
    });

    // ── Step 8: Persist messages to session ───────────────────────────────
    await chatSessionRepo.appendMessage(sessionId, {
      role: 'user', content: cleanMessage, timestamp: new Date(),
    });
    await chatSessionRepo.appendMessage(sessionId, {
      role:        'agent',
      content:     branded.reply,
      uiComponent: branded.uiComponent,
      uiProps:     branded.uiProps,
      agentUsed:   branded.agentUsed,
      timestamp:   new Date(),
    });
    await chatSessionRepo.updateIntent(sessionId, intent);

    // ── Step 9: Audit log ─────────────────────────────────────────────────
    await agentLogRepo.create({
      sessionId,
      agentName:    'MasterAgent',
      skillUsed:    'ORCHESTRATE',
      inputSummary: `intent=${intent}, msgLen=${cleanMessage.length}`,
      outputSummary:`agents=[${branded.agentUsed.join(',')}], ui=${branded.uiComponent}`,
      durationMs:   Date.now() - masterStart,
    });

    return {
      reply:       branded.reply,
      agentUsed:   branded.agentUsed,
      uiComponent: branded.uiComponent,
      uiProps:     branded.uiProps,
      intent,
      sessionId,
      isTyping:    false,
    };

  } catch (err) {
    console.error('[MasterAgent] Error:', err.message);
    return {
      reply:      "I'm experiencing a brief technical issue. Please try again in a moment.",
      agentUsed:  ['MasterAgent'],
      uiComponent: null,
      uiProps:    {},
      intent:     'ERROR',
      sessionId,
      isTyping:   false,
    };
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function _extractPhone(text) {
  const match = text.match(/\b\d{10}\b/);
  return match ? match[0] : null;
}

function _extractAmount(text) {
  const lower = text.toLowerCase();
  const crore = lower.match(/(\d+(?:\.\d+)?)\s*crore/);
  if (crore) return parseFloat(crore[1]) * 1e7;
  const lakh = lower.match(/(\d+(?:\.\d+)?)\s*lakh/);
  if (lakh) return parseFloat(lakh[1]) * 1e5;
  const k = lower.match(/(\d+(?:\.\d+)?)k\b/);
  if (k) return parseFloat(k[1]) * 1000;
  const plain = lower.match(/₹?\s*(\d[\d,]+)/);
  if (plain) return parseFloat(plain[1].replace(/,/g, ''));
  return null;
}

function _calculateEMI(text) {
  const principal   = _extractAmount(text);
  const rateMatch   = text.match(/(\d+(?:\.\d+)?)\s*%/);
  const tenureMatch = text.match(/(\d+)\s*month/i);

  if (!principal || !rateMatch || !tenureMatch) return null;

  const annualRate = parseFloat(rateMatch[1]);
  const r = annualRate / 12 / 100;
  const n = parseInt(tenureMatch[1], 10);
  const p = principal;

  const emi          = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayable = emi * n;
  const totalInterest= totalPayable - p;

  return { principal: p, rate: annualRate, tenure: n, emi, totalInterest, totalPayable };
}

function _extractLoanDetails(text) {
  let income = null;
  let employment = null;
  let emi = 0;
  let amount = null;

  // Amount - try to find it near 'loan' or 'amount' first
  const loanMatch = text.match(/(?:loan|borrow|amount).{0,15}?(?:rs\.?|inr|₹)?\s*(\d[\d,]+(?:k|lakh|crore)?)/i);
  if (loanMatch) {
    amount = _extractAmount(loanMatch[1]) || _extractAmount(text);
  } else {
    amount = _extractAmount(text);
  }

  // Income
  const incomeMatch = text.match(/(?:earn|income|salary|make|getting).{0,15}?(?:rs\.?|inr|₹)?\s*(\d[\d,]+)/i);
  if (incomeMatch) {
    income = parseFloat(incomeMatch[1].replace(/,/g, ''));
  } else {
    const pmMatch = text.match(/(\d[\d,]+)\s*(?:rs\.?|inr|₹)?\s*(?:per month|p\.m\.|a month|monthly)/i);
    if (pmMatch) income = parseFloat(pmMatch[1].replace(/,/g, ''));
  }

  // Avoid amount == income overlapping
  if (amount === income && text.match(/\d/g).length > 5) {
     // fallback if same number extracted
     amount = null; // will be defaulted to income * 6
  }

  // EMI
  const emiMatch = text.match(/(?:emi|paying).{0,15}?(?:rs\.?|inr|₹)?\s*(\d[\d,]+)/i);
  if (emiMatch) {
    emi = parseFloat(emiMatch[1].replace(/,/g, ''));
  }

  // Employment
  if (text.match(/self\s*[- ]?employed|business/i)) employment = 'SELF_EMPLOYED';
  else if (text.match(/contract|freelance/i)) employment = 'CONTRACT';
  else if (text.match(/salaried|salary|job/i)) employment = 'SALARIED';

  return { income, employment, emi, amount };
}

function _buildLoanReply(decision, eligibleAmount, uwResult) {
  if (decision === 'ERROR') {
    return `We encountered an issue checking your eligibility: ${uwResult.error || 'Unknown error'}. Please try again later.`;
  }
  if (decision === 'APPROVE') {
    return `Great news! Based on your profile, you are **Pre-Approved** for a loan of ${formatINR(eligibleAmount)}.\n\nThis is subject to document verification. Would you like to proceed with the application?`;
  }
  if (decision === 'MANUAL_REVIEW') {
    return `Your application requires a manual review by our team. We will contact you within 24 business hours with a decision.\n\nReason: ${uwResult.reasonMessage}`;
  }
  return `We're unable to proceed with your loan application at this time.\n\nReason: ${uwResult.reasonMessage || 'Not eligible'}\n\nFor assistance, you can speak with an advisor.`;
}

module.exports = { execute };
