// Purpose: Chat page — full-screen chat with AgentStatusBar, ChatWindow, and ChatInput
import React from 'react';
import AgentStatusBar from '../components/AgentStatusBar';
import ChatWindow     from '../components/ChatWindow';
import ChatInput      from '../components/ChatInput';

export default function ChatPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg-primary)' }}>
      <AgentStatusBar />
      <ChatWindow />
      <ChatInput />
    </div>
  );
}
