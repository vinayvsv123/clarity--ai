import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Animated background orbs */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>

      <div className="hero-container section-container">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles size={14} />
            <span>Powered by Gemini AI & RAG Architecture</span>
          </motion.div>

          {/* Headline */}
          <h1 className="hero-title">
            Chat with Your
            <br />
            <span className="gradient-text">Documents Using AI</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Upload PDFs and get instant AI-powered answers from your documents.
            Powered by advanced vector search and retrieval-augmented generation.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/signup">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Login
              </Button>
            </Link>
          </motion.div>

        </motion.div>

        {/* Hero visual — mock chat interface */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="hero-chat-window glass-card">
            <div className="hero-chat-header">
              <div className="hero-chat-dots">
                <span /><span /><span />
              </div>
              <span className="hero-chat-title">Clarity AI Chat</span>
            </div>
            <div className="hero-chat-body">
              <div className="hero-chat-msg hero-chat-user">
                <p>What are the key findings in this research paper?</p>
              </div>
              <div className="hero-chat-msg hero-chat-assistant">
                <div className="hero-chat-avatar">AI</div>
                <div>
                  <p>Based on the document, the key findings are:</p>
                  <p>1. <strong>Neural networks</strong> show 40% improvement in accuracy...</p>
                  <p>2. The proposed <strong>RAG architecture</strong> reduces hallucination by 65%...</p>
                  <div className="hero-chat-sources">
                    <span>📄 Sources: Page 12, Page 28, Page 45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
