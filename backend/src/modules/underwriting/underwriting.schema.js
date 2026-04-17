// Purpose: SOA Underwriting module — Zod schema for applicant data (zero external imports)
'use strict';

const { z } = require('zod');

/**
 * ApplicantSchema — validates all inputs to evaluateLoanEligibility.
 * This module has ZERO imports from other backend code.
 */
const ApplicantSchema = z.object({
  applicantId:     z.string().uuid('applicantId must be a valid UUID'),
  creditScore:     z.number().int().min(300).max(900),
  monthlyIncome:   z.number().positive(),
  requestedAmount: z.number().positive(),
  existingEMI:     z.number().min(0),
  employmentType:  z.enum(['SALARIED', 'SELF_EMPLOYED', 'CONTRACT']),
});

module.exports = { ApplicantSchema };
