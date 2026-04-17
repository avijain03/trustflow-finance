// Purpose: AgentLog repository — write-only audit log access
'use strict';

const AgentLog = require('../models/AgentLog.model');

/**
 * create — Append a new agent execution log entry.
 * This is the ONLY permitted operation on AgentLog.
 *
 * @param {object} data
 * @returns {Promise<AgentLog>}
 */
async function create(data) {
  try {
    return await AgentLog.create(data);
  } catch (err) {
    // Log failures must NEVER crash the agent pipeline — silently warn
    console.warn('[AgentLog.create] Failed to write log:', err.message);
    return null;
  }
}

module.exports = { create };
