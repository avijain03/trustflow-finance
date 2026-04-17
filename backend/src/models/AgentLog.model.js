// Purpose: AgentLog model — immutable audit log of all agent executions (no PII in plaintext)
'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const agentLogSchema = new mongoose.Schema(
  {
    logId: {
      type:    String,
      default: uuidv4,
      unique:  true,
    },
    sessionId:    { type: String, required: true, index: true },
    agentName:    { type: String, required: true },
    skillUsed:    { type: String },
    inputSummary: { type: String }, // NO PII — summarised descriptors only
    outputSummary:{ type: String },
    durationMs:   { type: Number, default: 0 },
    brandVersion: { type: String, default: 'TrustFlow-v2' },
  },
  {
    timestamps: true,
    // AgentLog is write-only — no updates allowed
    strict: true,
  }
);

// Prevent updates to logs (audit immutability)
agentLogSchema.pre(['updateOne', 'findOneAndUpdate', 'update'], function () {
  throw new Error('AgentLog records are immutable — cannot be updated');
});

const AgentLog = mongoose.model('AgentLog', agentLogSchema);
module.exports = AgentLog;
