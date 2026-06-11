import React, { useState, useRef, useMemo } from 'react';
import './Chatbot.css';
import useGetPublicSystemSettings from '../../hooks/system-settings-hooks/useGetPublicSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { tokenService } from '../../utils/tokenService';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const iframeRef = useRef(null);

  const { data: settings } = useGetPublicSystemSettings(['AICenter_Chatbot']);
  const chatbotBaseUrl = settings?.['AICenter_Chatbot'] || '';

  const { isAuthenticated } = useAuth();

  /**
   * Build the iframe src URL.
   * When the user is authenticated, append the JWT token as a query param so
   * the AI Center WebSocket can verify the identity and personalise responses.
   * We read the token lazily at render time — it will be fresh because
   * AuthContext keeps it up-to-date via the auto-refresh mechanism.
   */
  const chatbotUrl = useMemo(() => {
    if (!chatbotBaseUrl) return '';

    if (isAuthenticated) {
      const token = tokenService.getToken();
      if (token) {
        const separator = chatbotBaseUrl.includes('?') ? '&' : '?';
        return `${chatbotBaseUrl}${separator}token=${encodeURIComponent(token)}`;
      }
    }

    return chatbotBaseUrl;
  }, [chatbotBaseUrl, isAuthenticated]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      // Reload the iframe (clears chat history and re-reads token)
      iframeRef.current.src = chatbotUrl || iframeRef.current.src;
    }
  };

  return (
    <>
      {/* Chatbot Container */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <h3>Edunary Chatbot</h3>
          <div className="header-buttons">
            <button className="refresh-button" onClick={handleRefresh} title="Clear chat history">
              ↻
            </button>
            <button className="close-button" onClick={toggleChatbot}>
              ✕
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={chatbotUrl}
          className="chatbot-iframe"
          title="AI Chatbot"
          allow="microphone"
        />
      </div>

      {/* Toggle Button */}
      <button
        className={`chatbot-toggle-button ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChatbot}
        title="Open Chatbot"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
}

export default Chatbot;