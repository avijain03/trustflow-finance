// Purpose: ChatWindow — scrollable message list with auto-scroll and quick action buttons
import React, { useEffect } from 'react';
import useChatStore   from '../store/chatStore';
import MessageBubble  from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useAutoScroll } from '../hooks/useAutoScroll';

const QUICK_ACTIONS = ['Apply for a loan', 'Check my status', 'Calculate EMI', 'Upload documents'];

export default function ChatWindow() {
  const { messages, isTyping, sendMessage } = useChatStore();
  const { bottomRef, containerRef } = useAutoScroll([messages.length, isTyping]);

  return (
    <main
      ref={containerRef}
      style={{
        flex:       1,
        overflowY:  'auto',
        padding:    '80px 1rem 90px',
        display:    'flex',
        flexDirection: 'column',
        gap:        '1rem',
        maxWidth:   '920px',
        margin:     '0 auto',
        width:      '100%',
      }}
    >
      {/* Empty state — show quick actions */}
      {messages.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '3rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏦</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              TrustFlow Finance
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '400px', lineHeight: 1.6 }}>
              Ask me about loan eligibility, EMI calculations, or document requirements.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action}
                className="btn-ghost glow-target"
                onClick={() => sendMessage(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} style={{ height: 1 }} />
    </main>
  );
}
