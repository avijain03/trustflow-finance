// Purpose: Customer Mongoose model — stores applicant profile with hashed PII
'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type:    String,
      default: uuidv4,
      unique:  true,
      index:   true,
    },
    name:    { type: String, required: true, trim: true },
    phone:   {
      type:     String,
      unique:   true,
      trim:     true,
      match:    [/^\d{10}$/, 'Phone must be 10 digits'],
    },
    panHash:    { type: String, select: false }, // argon2id hash of PAN
    aadhaarHash:{ type: String, select: false }, // argon2id hash of Aadhaar
    employmentType: {
      type:     String,
      enum:     ['SALARIED', 'SELF_EMPLOYED', 'CONTRACT'],
      required: true,
    },
    monthlyIncome: { type: Number, required: true, min: 0 }, // stored in rupees
    existingEMI:   { type: Number, default: 0, min: 0 },     // stored in rupees
    creditScore:   { type: Number, min: 300, max: 900 },      // cached from bureau
    kycStatus: {
      type:    String,
      enum:    ['COMPLETE', 'INCOMPLETE'],
      default: 'INCOMPLETE',
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
