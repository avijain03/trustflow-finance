// Purpose: Customer repository — all DB access for Customer model
'use strict';

const Customer = require('../models/Customer.model');

/**
 * findByPhone — Lookup customer by phone number.
 * @param {string} phone
 * @returns {Promise<Customer|null>}
 */
async function findByPhone(phone) {
  try {
    return await Customer.findOne({ phone });
  } catch (err) {
    throw new Error(`[CustomerRepo.findByPhone] ${err.message}`);
  }
}

/**
 * findById — Lookup customer by MongoDB _id.
 * @param {string} id
 * @returns {Promise<Customer|null>}
 */
async function findById(id) {
  try {
    return await Customer.findById(id);
  } catch (err) {
    throw new Error(`[CustomerRepo.findById] ${err.message}`);
  }
}

/**
 * findByCustomerId — Lookup by UUID customerId field.
 * @param {string} customerId
 * @returns {Promise<Customer|null>}
 */
async function findByCustomerId(customerId) {
  try {
    return await Customer.findOne({ customerId });
  } catch (err) {
    throw new Error(`[CustomerRepo.findByCustomerId] ${err.message}`);
  }
}

/**
 * create — Insert a new customer record.
 * @param {object} data
 * @returns {Promise<Customer>}
 */
async function create(data) {
  try {
    return await Customer.create(data);
  } catch (err) {
    throw new Error(`[CustomerRepo.create] ${err.message}`);
  }
}

/**
 * updateKYCStatus — Update KYC status for a customer.
 * @param {string} customerId
 * @param {'COMPLETE'|'INCOMPLETE'} kycStatus
 * @returns {Promise<Customer|null>}
 */
async function updateKYCStatus(customerId, kycStatus) {
  try {
    return await Customer.findOneAndUpdate({ customerId }, { kycStatus }, { new: true });
  } catch (err) {
    throw new Error(`[CustomerRepo.updateKYCStatus] ${err.message}`);
  }
}

module.exports = { findByPhone, findById, findByCustomerId, create, updateKYCStatus };
