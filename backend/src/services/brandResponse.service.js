// Purpose: SKILL-011 — BrandResponse service — formats all API output with TrustFlow brand voice
'use strict';

/**
 * formatINR — Format a number as Indian Rupee currency string.
 * Uses Intl.NumberFormat with locale 'en-IN' for lakh/crore formatting.
 * ALL monetary output in the app must go through this function.
 *
 * Examples:
 *   formatINR(250000)  → "₹2,50,000"
 *   formatINR(1500000) → "₹15,00,000"
 *   formatINR(85000)   → "₹85,000"
 *
 * @param {number} amount — amount in rupees
 * @returns {string}
 */
function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * selectUIComponent — Map intent + decision to a UI component name.
 * Frontend renders the component specified in uiComponent.
 *
 * @param {string} intent
 * @param {string|null} decision
 * @returns {string|null}
 */
function selectUIComponent(intent, decision) {
  if (intent === 'GREETING')       return 'GreetingBanner';
  if (intent === 'EMI_CALCULATOR') return 'EMIBreakdownTable';
  if (intent === 'LOAN_ENQUIRY' && decision)  return 'LoanStatusCard';
  if (intent === 'DOCUMENT_UPLOAD') return 'DocumentChecklist';
  return null;
}

/**
 * formatBrandResponse — Apply TrustFlow brand voice and INR formatting to raw agent output.
 *
 * @param {{ rawReply: string, intent: string, decision?: string, eligibleAmount?: number, uiProps?: object }} rawOutput
 * @returns {{ reply: string, uiComponent: string|null, uiProps: object }}
 */
function formatBrandResponse(rawOutput) {
  const { rawReply, intent, decision, eligibleAmount, uiProps = {} } = rawOutput;

  let reply = rawReply || '';

  // Brand voice rules
  if (decision === 'REJECT') {
    reply = reply.replace(/cannot|can't|not eligible|rejected/gi, "We're unable to proceed");
  }

  if (decision === 'APPROVE' && eligibleAmount) {
    const formatted = formatINR(eligibleAmount);
    // Ensure the eligible amount appears in the reply
    if (!reply.includes('₹')) {
      reply = `${reply} Your pre-approved amount is ${formatted}.`;
    }
    // Replace any raw number with formatted version
    reply = reply.replace(String(eligibleAmount), formatted);
  }

  // Build formatted uiProps for monetary values
  const formattedUiProps = { ...uiProps };
  if (formattedUiProps.eligibleAmount) {
    formattedUiProps.eligibleAmountFormatted = formatINR(formattedUiProps.eligibleAmount);
  }
  if (formattedUiProps.principal) {
    formattedUiProps.principalFormatted = formatINR(formattedUiProps.principal);
  }
  if (formattedUiProps.monthlyEMI) {
    formattedUiProps.monthlyEMIFormatted = formatINR(formattedUiProps.monthlyEMI);
  }
  if (formattedUiProps.totalInterest) {
    formattedUiProps.totalInterestFormatted = formatINR(formattedUiProps.totalInterest);
  }
  if (formattedUiProps.totalPayable) {
    formattedUiProps.totalPayableFormatted = formatINR(formattedUiProps.totalPayable);
  }

  return {
    reply,
    uiComponent: selectUIComponent(intent, decision),
    uiProps:     formattedUiProps,
  };
}

module.exports = { formatINR, formatBrandResponse, selectUIComponent };
