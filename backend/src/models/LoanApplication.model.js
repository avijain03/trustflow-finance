// Purpose: LoanApplication model — tracks full lifecycle from DRAFT to decision
'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const documentSchema = new mongoose.Schema({
  docType:           { type: String, required: true },
  sanitizedFilename: { type: String, required: true },
  uploadedAt:        { type: Date, default: Date.now },
  verifyStatus: {
    type:    String,
    enum:    ['PENDING', 'VALID', 'INVALID', 'REQUIRES_REUPLOAD'],
    default: 'PENDING',
  },
}, { _id: false });

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type:    String,
      default: uuidv4,
      unique:  true,
      index:   true,
    },
    customerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Customer',
      required: true,
    },
    requestedAmount: { type: Number, required: true, min: 1 }, // rupees
    tenure:          { type: Number, required: true, min: 1 }, // months
    status: {
      type:    String,
      enum:    ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW'],
      default: 'DRAFT',
    },
    decision: {
      reasonCode:     String,
      reasonMessage:  String,
      eligibleAmount: Number, // rupees
      decidedAt:      Date,
    },
    documents: [documentSchema],
  },
  { timestamps: true }
);

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);
module.exports = LoanApplication;
