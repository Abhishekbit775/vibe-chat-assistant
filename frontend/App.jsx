import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const TONES = ['Professional', 'Casual', 'Concise'];

export default function ChatApp() {
  const [userId] = useState(`user_${Date.now()}`);
  const [threadId] = useState(`thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [currentTone, setCurrentTone] = useState('Professional');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation threads
  const fetchThreads = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/threads/${userId}`);
      if (response.data.success) {
        setThreads(response.data.threads);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat/send-message`, {
        threadId,
        userId,
        message: userMessage,
        tone: currentTone
      });

      if (response.data.success) {
        const aiResponse = response.data.aiResponse;
        streamMessage(aiResponse);
        fetchThreads();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: Could not connect to backend. Ensure MongoDB and backend server are running.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Stream message character by character
  const streamMessage = (text) => {
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < text.length) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: (updated[updated.length - 1].content || '') + text[charIndex]
          };
          return updated;
        });
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  // Change tone
  const handleToneChange = (tone) => {
    setCurrentTone(tone);
  };

  // Switch to thread
  const loadThread = async (selectedThreadId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/thread/${selectedThreadId}`);
      if (response.data.success) {
        setMessages(response.data.conversation.messages);
        setCurrentTone(response.data.conversation.tone);
      }
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  // Delete thread
  const deleteThread = async (threadIdToDelete) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/chat/thread/${threadIdToDelete}`);
      fetchThreads();
      if (threadIdToDelete === threadId) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar - History */}
      <aside className={`sidebar ${showHistory ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>💬 History</h3>
          <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
        </div>
        <div className="threads-list">
          {threads.length === 0 ? (
            <p className="no-threads">No conversations yet</p>
          ) : (
            threads.map(thread => (
              <div key={thread.threadId} className="thread-item">
                <div className="thread-info" onClick={() => loadThread(thread.threadId)}>
                  <span className="thread-tone">{thread.tone}</span>
                  <span className="thread-date">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteThread(thread.threadId)}
                  title="Delete thread"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="main-content">
        {/* Header */}
        <header className="chat-header">
          <div className="header-left">
            {!showHistory && (
              <button className="menu-btn" onClick={() => setShowHistory(true)}>☰</button>
            )}
            <h1>🎭 Vibe Chat Assistant</h1>
          </div>

          {/* Tone Toggle */}
          <div className="tone-toggle">
            {TONES.map(tone => (
              <button
                key={tone}
                className={`tone-btn ${currentTone === tone ? 'active' : ''}`}
                onClick={() => handleToneChange(tone)}
              >
                {tone}
              </button>
            ))}
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h2>👋 Welcome to Vibe Chat</h2>
              <p>Start a conversation in <strong>{currentTone}</strong> tone</p>
              <div className="tone-descriptions">
                <div>
                  <strong>Professional:</strong> Formal & business-like
                </div>
                <div>
                  <strong>Casual:</strong> Friendly & conversational
                </div>
                <div>
                  <strong>Concise:</strong> Brief & to the point
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role} ${msg.error ? 'error' : ''}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="chat-footer">
          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message in ${currentTone} tone...`}
              disabled={loading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? '⏳ Sending...' : '➤ Send'}
            </button>
          </form>
          <p className="info-text">Powered by Claude AI | Real-time Streaming</p>
        </footer>
      </div>
    </div>
  );
}
