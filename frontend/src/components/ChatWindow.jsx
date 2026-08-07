// Purpose: ChatWindow — scrollable message list (right 40% panel, no fixed positioning)
import React from 'react';
import useChatStore   from '../store/chatStore';
import MessageBubble  from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useAutoScroll } from '../hooks/useAutoScroll';

export default function ChatWindow() {
  const { messages, isTyping } = useChatStore();
  const { bottomRef, containerRef } = useAutoScroll([messages.length, isTyping]);

  return (
    <main
      ref={containerRef}
      style={{
        flex:          1,
        overflowY:     'auto',
        padding:       '1.25rem 1rem 0.5rem',
        display:       'flex',
        flexDirection: 'column',
        gap:           '1rem',
      }}
    >
      {/* Empty state */}
      {messages.length === 0 && (
        <div style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '1rem',
          padding:        '2rem 1rem',
          textAlign:      'center',
        }}>
          <div style={{ fontSize: '2.5rem' }}>🏦</div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, maxWidth: '280px' }}>
            Ask about loan eligibility, EMI calculations, or document requirements.
          </p>
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
