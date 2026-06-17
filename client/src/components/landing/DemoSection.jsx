import { motion } from 'framer-motion';
import './DemoSection.css';

export default function DemoSection() {
  return (
    <section className="demo section-padding">
      <div className="section-container">
        <motion.div
          className="demo-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Demo</span>
          <h2 className="section-title">See <span className="gradient-text">Clarity AI</span> in action</h2>
          <p className="section-subtitle">A preview of what intelligent document conversations look like.</p>
        </motion.div>

        <motion.div
          className="demo-window glass-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Window chrome */}
          <div className="demo-chrome">
            <div className="demo-dots">
              <span /><span /><span />
            </div>
            <div className="demo-url">clarity-ai.app/chat</div>
          </div>

          {/* Chat area */}
          <div className="demo-body">
            <div className="demo-sidebar-preview">
              <div className="demo-doc-item demo-doc-active">
                <span className="demo-doc-icon">📄</span>
                <span>Research_Paper.pdf</span>
              </div>
              <div className="demo-doc-item">
                <span className="demo-doc-icon">📄</span>
                <span>Contract_2024.pdf</span>
              </div>
              <div className="demo-doc-item">
                <span className="demo-doc-icon">📄</span>
                <span>Product_Spec.pdf</span>
              </div>
            </div>

            <div className="demo-chat-area">
              <div className="demo-msg demo-msg-user">
                <div className="demo-msg-content">Summarize the main objectives of this paper.</div>
              </div>
              <div className="demo-msg demo-msg-ai">
                <div className="demo-ai-avatar">AI</div>
                <div className="demo-msg-content">
                  <p>Based on the research paper, the main objectives are:</p>
                  <p><strong>1. Primary Objective:</strong> To develop a novel retrieval-augmented generation framework that reduces LLM hallucination rates by leveraging document-specific context windows.</p>
                  <p><strong>2. Secondary Objective:</strong> To evaluate the effectiveness of vector-based semantic search compared to traditional keyword-based retrieval in domain-specific applications.</p>
                  <div className="demo-sources">
                    📎 Sources: Section 1.1 (p.3), Abstract (p.1), Methodology (p.8)
                  </div>
                </div>
              </div>
              <div className="demo-msg demo-msg-user">
                <div className="demo-msg-content">What methodology did they use?</div>
              </div>
              <div className="demo-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
