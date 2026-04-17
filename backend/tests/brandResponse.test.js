// Purpose: Brand response service tests — INR formatting and brand voice rules
'use strict';

const { formatINR, formatBrandResponse, selectUIComponent } = require('../src/services/brandResponse.service');

describe('BrandResponse Service', () => {

  /* ── INR Formatting ─────────────────────────────────────────── */
  describe('formatINR — Indian Rupee formatting', () => {
    it('₹250000 → "₹2,50,000"', () => {
      expect(formatINR(250000)).toContain('2,50,000');
    });
    it('₹1500000 → "₹15,00,000"', () => {
      expect(formatINR(1500000)).toContain('15,00,000');
    });
    it('₹85000 → "₹85,000"', () => {
      expect(formatINR(85000)).toContain('85,000');
    });
    it('0 → "₹0"', () => {
      expect(formatINR(0)).toContain('0');
    });
    it('NaN → "₹0"', () => {
      expect(formatINR(NaN)).toBe('₹0');
    });
  });

  /* ── Brand Voice ────────────────────────────────────────────── */
  describe('formatBrandResponse — brand voice rules', () => {
    it('REJECT → reply contains "We\'re unable to proceed"', () => {
      const r = formatBrandResponse({ rawReply: 'We cannot approve this loan.', intent: 'LOAN_ENQUIRY', decision: 'REJECT' });
      expect(r.reply).toContain("We're unable to proceed");
    });
    it('APPROVE + eligibleAmount → amount formatted in reply', () => {
      const r = formatBrandResponse({ rawReply: 'You are approved for 250000.', intent: 'LOAN_ENQUIRY', decision: 'APPROVE', eligibleAmount: 250000 });
      expect(r.reply).toContain('2,50,000');
    });
    it('uiProps.eligibleAmount → eligibleAmountFormatted added', () => {
      const r = formatBrandResponse({ rawReply: 'Approved', intent: 'LOAN_ENQUIRY', decision: 'APPROVE', eligibleAmount: 250000, uiProps: { eligibleAmount: 250000 } });
      expect(r.uiProps.eligibleAmountFormatted).toContain('2,50,000');
    });
  });

  /* ── UI Component Selection ─────────────────────────────────── */
  describe('selectUIComponent', () => {
    it('LOAN_ENQUIRY + decision → LoanStatusCard', () => {
      expect(selectUIComponent('LOAN_ENQUIRY', 'APPROVE')).toBe('LoanStatusCard');
    });
    it('EMI_CALCULATOR → EMIBreakdownTable', () => {
      expect(selectUIComponent('EMI_CALCULATOR', null)).toBe('EMIBreakdownTable');
    });
    it('GREETING → GreetingBanner', () => {
      expect(selectUIComponent('GREETING', null)).toBe('GreetingBanner');
    });
    it('UNKNOWN → null', () => {
      expect(selectUIComponent('UNKNOWN', null)).toBeNull();
    });
  });

});
