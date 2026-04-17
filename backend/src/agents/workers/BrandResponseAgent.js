// Purpose: BrandResponseAgent — final brand voice pass, called IN-PROCESS by MasterAgent
'use strict';

const { formatBrandResponse, formatINR } = require('../../services/brandResponse.service');

/**
 * execute — Apply TrustFlow brand formatting to raw agent output.
 * Called in-process by MasterAgent (not via HTTP — no internalAuth needed).
 *
 * @param {{ rawReply, agentUsed, intent, decision, eligibleAmount?, uiProps? }} payload
 * @returns {{ reply, uiComponent, uiProps, agentUsed }}
 */
function execute({ rawReply, agentUsed = [], intent, decision, eligibleAmount, uiProps = {} }) {
  try {
    const branded = formatBrandResponse({ rawReply, intent, decision, eligibleAmount, uiProps });
    return { ...branded, agentUsed: [...agentUsed, 'BrandResponseAgent'] };
  } catch (err) {
    return {
      reply:        rawReply || 'TrustFlow Agent online.',
      uiComponent:  null,
      uiProps:      {},
      agentUsed,
    };
  }
}

module.exports = { execute };
