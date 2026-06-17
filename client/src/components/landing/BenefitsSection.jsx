import { motion } from 'framer-motion';
import { Clock, Zap, Target, Lock } from 'lucide-react';
import './BenefitsSection.css';

const benefits = [
  { icon: Clock, title: 'Save Research Time', description: 'Get answers in seconds instead of hours of manual document reading and searching.' },
  { icon: Zap, title: 'Instant Knowledge Retrieval', description: 'Access information from any part of your documents with natural language queries.' },
  { icon: Target, title: 'Accurate Context-Aware Answers', description: 'RAG architecture ensures responses are grounded in your actual document content.' },
  { icon: Lock, title: 'Secure Personal Workspace', description: 'Your documents and conversations are private, encrypted, and accessible only to you.' },
];

export default function BenefitsSection() {
  return (
    <section className="benefits section-padding">
      <div className="section-container">
        <motion.div
          className="benefits-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Benefits</span>
          <h2 className="section-title">Why choose <span className="gradient-text">Clarity AI</span></h2>
          <p className="section-subtitle">Transform how you interact with documents and extract knowledge.</p>
        </motion.div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="benefit-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="benefit-icon-bg">
                <benefit.icon size={24} />
              </div>
              <div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
