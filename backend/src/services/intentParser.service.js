// Purpose: SKILL-007 — Intent parser for chat messages including Hinglish and TrustFlow brand triggers, now powered by Mistral via Ollama
'use strict';

/**
 * parseUserIntent — Classify a chat message into one of the defined intents using local LLM.
 *
 * @param {string} message — sanitised user input
 * @returns {Promise<{intent: string, answer: string|null}>}
 */
function _regexFallbackParser(message) {
  const lower = message.toLowerCase();
  if (lower.match(/hello|hi\b|hey|help/)) return { intent: 'GREETING', answer: null };
  if (lower.match(/apply|loan|eligible|eligibility/)) return { intent: 'LOAN_ENQUIRY', answer: null };
  if (lower.match(/status|track/)) return { intent: 'APPLICATION_STATUS', answer: null };
  if (lower.match(/upload|document|kyc|pan\b|aadhaar/)) return { intent: 'DOCUMENT_UPLOAD', answer: null };
  if (lower.match(/emi|calculate|interest/)) return { intent: 'EMI_CALCULATOR', answer: null };
  return { intent: 'UNKNOWN', answer: null };
}

async function parseUserIntent(message) {
  if (!message || typeof message !== 'string') return { intent: 'UNKNOWN', answer: null };

  const systemPrompt = `You are the core intelligence for TrustFlow Finance, an AI lending assistant.
Your task is to classify the user's message into an intent. You can also answer basic user queries related to loans, finance, and EMIs.
Do NOT answer questions that are not related to finance, loans, EMI, or document verification.

Possible intents:
1. GREETING: The user is saying hello or asking for help.
2. LOAN_ENQUIRY: The user wants to apply for a loan or check eligibility.
3. APPLICATION_STATUS: The user wants to check the status of a loan application.
4. DOCUMENT_UPLOAD: The user wants to upload KYC or financial documents.
5. EMI_CALCULATOR: The user wants to calculate EMI or asks about loan repayment amounts.
6. GENERAL_QUERY: The user is asking a basic question about finance, loans, EMI, or TrustFlow services.
7. UNKNOWN: The user is asking about something completely unrelated (e.g., coding, history, weather) or the intent is unclear.

You MUST respond in valid JSON format only.
Format: { "intent": "INTENT_NAME", "answer": "If intent is GENERAL_QUERY, put your helpful response here. If UNKNOWN, politely decline to answer saying you only handle finance. Otherwise, put null." }`;

  // 1. Try Gemini if API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Message: "${message}"\n\nJSON Output:` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.candidates[0].content.parts[0].text.trim());
        return { intent: result.intent || 'UNKNOWN', answer: result.answer || null };
      }
    } catch (err) {
      console.warn('[IntentParser] Gemini API failed, falling back...', err.message);
    }
  }

  // 2. Try Local Ollama Model
  try {
    const ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest';
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15000); // 15s timeout for local LLM

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({
        model: ollamaModel,
        prompt: `${systemPrompt}\n\nUser Message: "${message}"\n\nJSON Output:`,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 }
      })
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      const result = JSON.parse(data.response.trim());
      return { intent: result.intent || 'UNKNOWN', answer: result.answer || null };
    }
  } catch (error) {
    console.warn(`[IntentParser] Ollama API Error (${error.name === 'AbortError' ? 'Timeout' : error.message}), falling back to regex...`);
  }

  // 3. Fallback to basic regex
  console.log('[IntentParser] Using regex fallback parser.');
  return _regexFallbackParser(message);
}

module.exports = { parseUserIntent };
