import { motion } from 'framer-motion';
import { FileUp, Brain, Search, Shield, MessageSquare, Zap } from 'lucide-react';
import './FeaturesSection.css';

const features = [
  {
    icon: FileUp,
    title: 'PDF Upload & Processing',
    description: 'Upload PDF documents that are automatically processed, chunked, and indexed for AI-powered search.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Q&A',
    description: 'Ask natural language questions and get accurate, context-aware answers powered by Gemini AI.',
  },
  {
    icon: Search,
    title: 'Vector Search with Pinecone',
    description: 'Lightning-fast semantic search using vector embeddings for precise document retrieval.',
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Enterprise-grade JWT authentication keeps your documents and conversations private.',
  },
  {
    icon: MessageSquare,
    title: 'Chat History Management',
    description: 'Full conversation persistence — revisit past questions and answers anytime.',
  },
  {
    icon: Zap,
    title: 'Fast Semantic Search',
    description: 'Sub-second response times with optimized embedding pipelines and vector indexing.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="features section-padding">
      <div className="section-container">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Features</span>
          <h2 className="section-title">Everything you need to unlock<br /><span className="gradient-text">document intelligence</span></h2>
          <p className="section-subtitle">
            A complete platform for uploading, processing, and intelligently querying your documents with AI.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-icon">
                <feature.icon size={24} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
