// Purpose: ChatSession model — persists multi-turn conversation with message history
'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
  role:        { type: String, enum: ['user', 'agent'], required: true },
  content:     { type: String, required: true },
  uiComponent: { type: String, default: null }, // e.g. 'LoanStatusCard' | 'EMIBreakdownTable'
  uiProps:     { type: mongoose.Schema.Types.Mixed, default: null },
  agentUsed:   [{ type: String }],
  timestamp:   { type: Date, default: Date.now },
}, { _id: false });

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type:    String,
      default: uuidv4,
      unique:  true,
      index:   true,
    },
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    messages:      [messageSchema],
    currentIntent: { type: String, default: null },
    status: {
      type:    String,
      enum:    ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
