// Purpose: LoanApplication repository — all DB access for LoanApplication model
'use strict';

const LoanApplication = require('../models/LoanApplication.model');

async function create(data) {
  try {
    return await LoanApplication.create(data);
  } catch (err) {
    throw new Error(`[LoanRepo.create] ${err.message}`);
  }
}

async function findByCustomer(customerId) {
  try {
    return await LoanApplication.find({ customerId }).sort({ createdAt: -1 });
  } catch (err) {
    throw new Error(`[LoanRepo.findByCustomer] ${err.message}`);
  }
}

async function findById(applicationId) {
  try {
    return await LoanApplication.findOne({ applicationId });
  } catch (err) {
    throw new Error(`[LoanRepo.findById] ${err.message}`);
  }
}

async function updateStatus(applicationId, status, decision) {
  try {
    const update = { status };
    if (decision) update.decision = { ...decision, decidedAt: new Date() };
    return await LoanApplication.findOneAndUpdate({ applicationId }, update, { new: true });
  } catch (err) {
    throw new Error(`[LoanRepo.updateStatus] ${err.message}`);
  }
}

async function appendDocument(applicationId, docData) {
  try {
    return await LoanApplication.findOneAndUpdate(
      { applicationId },
      { $push: { documents: docData } },
      { new: true }
    );
  } catch (err) {
    throw new Error(`[LoanRepo.appendDocument] ${err.message}`);
  }
}

module.exports = { create, findByCustomer, findById, updateStatus, appendDocument };
