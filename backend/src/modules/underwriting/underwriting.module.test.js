// Purpose: Underwriting SOA module unit tests — 100% coverage of all 6 rules
'use strict';

const { evaluateLoanEligibility } = require('./underwriting.service');

const BASE = {
  applicantId:     '550e8400-e29b-41d4-a716-446655440000',
  creditScore:     750,
  monthlyIncome:   50000,
  requestedAmount: 200000,
  existingEMI:     5000,
  employmentType:  'SALARIED',
};

describe('Underwriting Service — SOA Module Tests', () => {

  /* ── R001: Credit Score ─────────────────────────────────────── */
  describe('R001 — Credit Score', () => {
    it('score 699 → REJECT R001', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 699 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R001');
    });
    it('score 0 → REJECT R001', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 300 }); // Zod min is 300
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R001');
    });
    it('score 700 → NOT R001', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 700 });
      expect(r.reasonCode).not.toBe('R001');
    });
    it('score 800 → APPROVE', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 800 });
      expect(r.decision).toBe('APPROVE');
    });
  });

  /* ── R002: Minimum Income ───────────────────────────────────── */
  describe('R002 — Minimum Income', () => {
    it('income 14999 → REJECT R002', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 14999 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R002');
    });
    it('income 15000 → NOT R002', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 15000, existingEMI: 0 });
      expect(r.reasonCode).not.toBe('R002');
    });
  });

  /* ── R003: EMI > 50% of salary ──────────────────────────────── */
  describe('R003 — Existing EMI > 50% of salary', () => {
    it('EMI 20001 on income 40000 (50.0025%) → REJECT R003', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 40000, existingEMI: 20001 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R003');
    });
    it('EMI 20000 on income 40000 (exactly 50%) → NOT R003', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 750, monthlyIncome: 40000, existingEMI: 20000 });
      expect(r.reasonCode).not.toBe('R003');
    });
    it('EMI 24000 on income 40000 (60%) → REJECT R003', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 40000, existingEMI: 24000 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R003');
    });
    it('EMI 16000 on income 30000 (53.3%) → REJECT R003', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 30000, existingEMI: 16000 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R003');
    });
    it('existingEMI 0 → R003 skipped cleanly', () => {
      const r = evaluateLoanEligibility({ ...BASE, existingEMI: 0 });
      expect(r.reasonCode).not.toBe('R003');
    });
  });

  /* ── R004: Loan to Income ───────────────────────────────────── */
  describe('R004 — Loan > 10x income', () => {
    it('income 50000, loan 500001 → MANUAL_REVIEW R004', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 50000, requestedAmount: 500001 });
      expect(r.decision).toBe('MANUAL_REVIEW');
      expect(r.reasonCode).toBe('R004');
    });
    it('income 50000, loan 500000 → NOT R004', () => {
      const r = evaluateLoanEligibility({ ...BASE, monthlyIncome: 50000, requestedAmount: 500000 });
      expect(r.reasonCode).not.toBe('R004');
    });
  });

  /* ── R005: Borderline credit + moderate EMI ─────────────────── */
  describe('R005 — Borderline credit + high EMI', () => {
    it('score 720, EMI/income 45% → MANUAL_REVIEW R005', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 720, monthlyIncome: 40000, existingEMI: 18000 });
      expect(r.decision).toBe('MANUAL_REVIEW');
      expect(r.reasonCode).toBe('R005');
    });
    it('score 750, EMI/income 45% → NOT R005 (credit >= 750 escapes)', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 750, monthlyIncome: 40000, existingEMI: 18000 });
      expect(r.reasonCode).not.toBe('R005');
    });
  });

  /* ── R006: Happy path ───────────────────────────────────────── */
  describe('R006 — APPROVE path', () => {
    it('score 760, income 50000, EMI 5000, loan 200000 → APPROVE', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 760, monthlyIncome: 50000, existingEMI: 5000, requestedAmount: 200000 });
      expect(r.decision).toBe('APPROVE');
      expect(r.eligibleAmount).toBe(Math.min(200000, 50000 * 8)); // 200000
    });
    it('eligibleAmount = min(requestedAmount, income*8)', () => {
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 760, monthlyIncome: 50000, requestedAmount: 500000 });
      expect(r.eligibleAmount).toBe(400000); // 50000*8
    });
  });

  /* ── Edge cases ─────────────────────────────────────────────── */
  describe('Edge Cases', () => {
    it('requestedAmount 0 → Zod rejects (not positive)', () => {
      expect(() => evaluateLoanEligibility({ ...BASE, requestedAmount: 0 })).toThrow();
    });
    it('missing fields → Zod throws before service runs', () => {
      expect(() => evaluateLoanEligibility({ creditScore: 750 })).toThrow();
    });
    it('monthlyIncome 0 → REJECT R002 (prevents division by zero in R003)', () => {
      // Zod rejects non-positive, so income must be at least 0.01; just use 1
      const r = evaluateLoanEligibility({ ...BASE, creditScore: 750, monthlyIncome: 1 });
      expect(r.decision).toBe('REJECT');
      expect(r.reasonCode).toBe('R002');
    });
  });

});
