// Purpose: SKILL-004 + SKILL-005 — CRM service: customer lookup and record creation
'use strict';

const customerRepo = require('../repositories/customer.repository');
const { hashPII }  = require('../utils/hashPII');

/**
 * lookupCustomer — Find customer by phone number.
 * @param {string} phone
 * @returns {Promise<Customer|null>}
 */
async function lookupCustomer(phone) {
  if (!phone) return null;
  return customerRepo.findByPhone(phone);
}

/**
 * lookupCustomerById — Find customer by UUID customerId.
 * @param {string} customerId
 * @returns {Promise<Customer|null>}
 */
async function lookupCustomerById(customerId) {
  return customerRepo.findByCustomerId(customerId);
}

/**
 * createCustomerRecord — Create a new customer profile.
 * Hashes PAN and Aadhaar with argon2id before insertion.
 *
 * @param {{ name, phone, pan?, aadhaar?, employmentType, monthlyIncome, existingEMI? }} data
 * @returns {Promise<Customer>}
 */
async function createCustomerRecord(data) {
  const { pan, aadhaar, ...rest } = data;
  const insertData = { ...rest };

  if (pan)     insertData.panHash     = await hashPII(pan);
  if (aadhaar) insertData.aadhaarHash = await hashPII(aadhaar);

  return customerRepo.create(insertData);
}

/**
 * updateKYCStatus — Mark KYC as complete or incomplete.
 * @param {string} customerId
 * @param {'COMPLETE'|'INCOMPLETE'} status
 */
async function updateKYCStatus(customerId, status) {
  return customerRepo.updateKYCStatus(customerId, status);
}

module.exports = { lookupCustomer, lookupCustomerById, createCustomerRecord, updateKYCStatus };
