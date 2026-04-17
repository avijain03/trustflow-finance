// Purpose: CRMAgent — adapter around crm.service for customer lookup and creation
'use strict';

const { lookupCustomer, lookupCustomerById, createCustomerRecord } = require('../../services/crm.service');

/**
 * execute — Look up existing customer or return null for new applicants.
 * @param {{ phone?: string, customerId?: string }} payload
 */
async function execute({ phone, customerId }) {
  try {
    let customer = null;
    if (customerId) customer = await lookupCustomerById(customerId);
    if (!customer && phone) customer = await lookupCustomer(phone);
    return { customer, isNewCustomer: !customer };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { execute, lookupCustomer, createCustomerRecord };
