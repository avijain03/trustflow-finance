// Purpose: Zustand chat store — global state for messages, session, user, typing indicator
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage as apiSendMessage, uploadDocument as apiUploadDocument } from '../api/agent.api';

/**
 * useChatStore — Central state for TrustFlow Finance chat UI.
 *
 * Persistence: token + sessionId in sessionStorage (cleared on tab close).
 */
const useChatStore = create((set, get) => ({
  messages:      [],
  sessionId:     sessionStorage.getItem('tf_sessionId') || null,
  isTyping:      false,
  currentIntent: null,
  user:          JSON.parse(sessionStorage.getItem('tf_user') || 'null'),

  /* ── Actions ──────────────────────────────────────────────────────────── */

  /**
   * sendMessage — Append user message, call API, append agent reply.
   * Sets isTyping while waiting.
   */
  sendMessage: async (content) => {
    const state = get();
    if (!content.trim() || state.isTyping) return;

    // Ensure a sessionId exists
    let { sessionId } = state;
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('tf_sessionId', sessionId);
      set({ sessionId });
    }

    // Append user message immediately
    const userMsg = {
      id:        uuidv4(),
      role:      'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set(s => ({ messages: [...s.messages, userMsg], isTyping: true }));

    try {
      const data = await apiSendMessage(content, sessionId);

      const agentMsg = {
        id:          uuidv4(),
        role:        'agent',
        content:     data.reply,
        uiComponent: data.uiComponent || null,
        uiProps:     data.uiProps     || {},
        agentUsed:   data.agentUsed   || ['MasterAgent'],
        timestamp:   new Date().toISOString(),
      };

      set(s => ({
        messages:      [...s.messages, agentMsg],
        isTyping:      false,
        currentIntent: data.intent || null,
      }));
    } catch (err) {
      const errorMsg = {
        id:        uuidv4(),
        role:      'agent',
        content:   err.message || 'TrustFlow Agent is temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString(),
        agentUsed: ['MasterAgent'],
      };
      set(s => ({ messages: [...s.messages, errorMsg], isTyping: false }));
    }
  },

  /**
   * uploadDocument — Send file to backend DocumentVerificationAgent.
   */
  uploadDocument: async (file, docType = 'UNKNOWN') => {
    set({ isTyping: true });
    try {
      const data    = await apiUploadDocument(file, docType);
      const agentMsg = {
        id:        uuidv4(),
        role:      'agent',
        content:   data.status === 'VALID'
          ? `✅ Document "${file.name}" verified successfully.`
          : data.status === 'REQUIRES_REUPLOAD'
            ? `⚠️ Please re-upload "${file.name}" — it appears to be a scanned image without a text layer. Please use a proper PDF.`
            : `❌ Document "${file.name}" could not be verified (code: ${data.errorCode}). Please check the file and try again.`,
        timestamp: new Date().toISOString(),
        agentUsed: ['DocumentVerificationAgent'],
      };
      set(s => ({ messages: [...s.messages, agentMsg], isTyping: false }));
    } catch {
      set({ isTyping: false });
    }
  },

  /** setUser — Persist logged-in user to sessionStorage. */
  setUser: (userData) => {
    sessionStorage.setItem('tf_user',  JSON.stringify(userData));
    sessionStorage.setItem('tf_token', userData.token);
    set({ user: userData });
  },

  /** clearSession — Logout: clear all state and sessionStorage. */
  clearSession: () => {
    sessionStorage.removeItem('tf_user');
    sessionStorage.removeItem('tf_token');
    sessionStorage.removeItem('tf_sessionId');
    set({ user: null, messages: [], sessionId: null, currentIntent: null, isTyping: false });
  },

  setIsTyping:      (bool)   => set({ isTyping: bool }),
  setCurrentIntent: (intent) => set({ currentIntent: intent }),
}));

export default useChatStore;
