import { motion } from 'framer-motion';
import { Upload, Layers, Database, HelpCircle, MessageCircle } from 'lucide-react';
import './HowItWorksSection.css';

const steps = [
  { icon: Upload, label: 'Upload PDF', description: 'Upload your document through drag & drop or file browser' },
  { icon: Layers, label: 'Chunking & Embedding', description: 'Document is split into chunks and converted to vectors' },
  { icon: Database, label: 'Vector Storage', description: 'Embeddings are stored in Pinecone for fast retrieval' },
  { icon: HelpCircle, label: 'Ask Questions', description: 'Type your question in natural language' },
  { icon: MessageCircle, label: 'Get AI Answers', description: 'Receive accurate, context-aware responses with sources' },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="how-it-works section-padding">
      <div className="section-container">
        <motion.div
          className="how-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From upload to insight in <span className="gradient-text">5 simple steps</span></h2>
          <p className="section-subtitle">
            Our RAG pipeline processes your documents and makes them intelligently searchable.
          </p>
        </motion.div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              className="step-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-icon-wrapper">
                <div className="step-icon">
                  <step.icon size={28} />
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
              <h3 className="step-label">{step.label}</h3>
              <p className="step-description">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
