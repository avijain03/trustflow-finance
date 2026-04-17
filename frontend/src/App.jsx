// Purpose: App root — routing, ProtectedRoute, CursorGlow, Toast system
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CursorGlow } from './hooks/useCursorGlow.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import ChatPage   from './pages/ChatPage';
import useChatStore from './store/chatStore';

/** ProtectedRoute — redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
  const user = useChatStore(s => s.user);
  return user ? children : <Navigate to="/login" replace />;
}

/** Toast listener — listens for tf:toast custom events */
function ToastListener() {
  useEffect(() => {
    const handler = (e) => {
      const { message, type } = e.detail;
      // Simple toast via alert for now — replace with a toast library if desired
      console.warn(`[TrustFlow Toast] [${type}]`, message);
    };
    window.addEventListener('tf:toast', handler);
    return () => window.removeEventListener('tf:toast', handler);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* 60fps cursor glow — rendered behind everything */}
      <CursorGlow />
      <ToastListener />

      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat"     element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/"         element={<Navigate to="/chat" replace />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
