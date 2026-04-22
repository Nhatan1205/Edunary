import React, { useState, useRef } from 'react';
import './Chatbot.css';
import useGetPublicSystemSettings from '../../hooks/system-settings-hooks/useGetPublicSystemSettings';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const iframeRef = useRef(null);
  const { data: settings } = useGetPublicSystemSettings(["Chatbot_ServiceUrl"]);
  const chatbotUrl = settings?.["Chatbot_ServiceUrl"] || "nothing";

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
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
          title="AI Chatbot Demo"
          allow="microphone">
        </iframe>
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </>
  );
}

export default Chatbot;