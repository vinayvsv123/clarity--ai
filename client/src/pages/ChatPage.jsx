import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, FileText, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import documentService from '../services/documentService';
import chatService from '../services/chatService';

import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './ChatPage.css';

export default function ChatPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchDocumentAndHistory = useCallback(async () => {
    try {
      const [docData, historyData] = await Promise.all([
        documentService.getDocumentById(documentId),
        chatService.getChatHistory(documentId),
      ]);
      setDoc(docData);
      setMessages(historyData?.history?.messages || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat workspace');
      navigate('/app/documents');
    } finally {
      setLoading(false);
    }
  }, [documentId, navigate]);

  useEffect(() => {
    fetchDocumentAndHistory();
  }, [fetchDocumentAndHistory]);

  // Scroll to bottom on message list change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Append user message immediately
    const tempUserMsg = {
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await chatService.askQuestion(documentId, userMessage);
      
      const assistantMsg = {
        role: 'assistant',
        content: reply.answer,
        createdAt: new Date().toISOString(),
        sources: reply.sources, // count of sources
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to get answer from AI');
      // Remove the user message since the turn failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (messages.length === 0) return;
    if (!window.confirm('Are you sure you want to clear this chat history?')) return;

    setClearing(true);
    try {
      await chatService.deleteChatHistory(documentId);
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to clear chat history');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-page-loading">
        <Skeleton height="60px" className="mb-4" />
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Header bar */}
      <div className="chat-header-bar glass">
        <div className="chat-header-left">
          <Link to="/app/documents" className="chat-back-btn">
            <ArrowLeft size={18} />
          </Link>
          <div className="chat-doc-info">
            <FileText size={20} className="chat-doc-icon" />
            <div className="chat-doc-meta">
              <span className="chat-doc-name" title={doc?.originalName}>
                {doc?.originalName}
              </span>
              <span className="chat-doc-status-text">Active Chat Session</span>
            </div>
          </div>
        </div>

        <div className="chat-header-right">
          {messages.length > 0 && (
            <Button
              variant="danger-ghost"
              size="sm"
              icon={Trash2}
              onClick={handleClearHistory}
              loading={clearing}
            >
              Clear History
            </Button>
          )}
        </div>
      </div>

      {/* Message scrolling logs area */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-welcome-state">
            <EmptyState
              icon={Bot}
              title="Start Chatting"
              description={`Ask anything about "${doc?.originalName}". Our AI model is primed with the document context and ready to answer.`}
            />
            <div className="suggested-questions-row">
              <button
                className="suggested-q"
                onClick={() => setInput('Summarize the main topics in this document.')}
              >
                Summarize document
              </button>
              <button
                className="suggested-q"
                onClick={() => setInput('What are the key findings or takeaways?')}
              >
                Key takeaways
              </button>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  className={`message-bubble-row ${isUser ? 'user-row' : 'assistant-row'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="message-avatar-box">
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className="message-bubble-content-block">
                    <div className="message-bubble">
                      {isUser ? (
                        <p className="message-text-raw">{msg.content}</p>
                      ) : (
                        <div className="message-markdown">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    <div className="message-meta-row">
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isUser && msg.sources !== undefined && (
                        <>
                          <span className="meta-bullet">•</span>
                          <span className="message-sources">
                            Used {msg.sources} source{msg.sources !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing / thinking indicator */}
            {sending && (
              <motion.div
                className="message-bubble-row assistant-row typing-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="message-avatar-box">
                  <Bot size={16} />
                </div>
                <div className="message-bubble-content-block">
                  <div className="message-bubble typing-bubble">
                    <div className="typing-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="chat-input-sticky-footer">
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            placeholder={`Ask a question about ${doc?.originalName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            className="chat-text-input"
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || sending}
            icon={Send}
            className="chat-send-btn"
          />
        </form>
      </div>
    </div>
  );
}
