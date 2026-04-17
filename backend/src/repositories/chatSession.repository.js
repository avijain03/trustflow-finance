// Purpose: ChatSession repository — session creation, message appending, lookup
'use strict';

const ChatSession = require('../models/ChatSession.model');

async function create(data) {
  try {
    return await ChatSession.create(data);
  } catch (err) {
    throw new Error(`[ChatSessionRepo.create] ${err.message}`);
  }
}

async function findBySessionId(sessionId) {
  try {
    return await ChatSession.findOne({ sessionId });
  } catch (err) {
    throw new Error(`[ChatSessionRepo.findBySessionId] ${err.message}`);
  }
}

async function appendMessage(sessionId, message) {
  try {
    return await ChatSession.findOneAndUpdate(
      { sessionId },
      { $push: { messages: message } },
      { new: true, upsert: false }
    );
  } catch (err) {
    throw new Error(`[ChatSessionRepo.appendMessage] ${err.message}`);
  }
}

async function updateIntent(sessionId, currentIntent) {
  try {
    return await ChatSession.findOneAndUpdate({ sessionId }, { currentIntent }, { new: true });
  } catch (err) {
    throw new Error(`[ChatSessionRepo.updateIntent] ${err.message}`);
  }
}

async function closeSession(sessionId) {
  try {
    return await ChatSession.findOneAndUpdate({ sessionId }, { status: 'CLOSED' }, { new: true });
  } catch (err) {
    throw new Error(`[ChatSessionRepo.closeSession] ${err.message}`);
  }
}

module.exports = { create, findBySessionId, appendMessage, updateIntent, closeSession };
