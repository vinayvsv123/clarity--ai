import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './FAQSection.css';

const faqs = [
  {
    question: 'What document types are supported?',
    answer: 'Currently, Clarity AI supports PDF documents. DOCX support is also available. We are working on adding support for more document formats including TXT, Markdown, and PowerPoint files.',
  },
  {
    question: 'How secure is my data?',
    answer: 'Your documents and conversations are protected with enterprise-grade security. We use JWT-based authentication, encrypted data transmission (HTTPS), and your documents are stored in isolated user-specific namespaces. Only you can access your uploaded documents.',
  },
  {
    question: 'How accurate are the AI answers?',
    answer: 'Clarity AI uses Retrieval-Augmented Generation (RAG) architecture, which grounds all answers in your actual document content. This significantly reduces AI hallucination. Each answer includes source references so you can verify the information.',
  },
  {
    question: 'Are there any usage limits?',
    answer: 'The free tier includes 5 document uploads and 50 questions per month. The Pro tier offers unlimited uploads and questions. Document size is limited to 50MB per file.',
  },
  {
    question: 'Can I delete my documents and data?',
    answer: 'Yes, you have full control over your data. You can delete individual documents, chat histories, or your entire account at any time. Deletion is permanent and removes all associated data from our systems.',
  },
  {
    question: 'What AI model powers the answers?',
    answer: 'Clarity AI is powered by Google\'s Gemini AI model combined with our custom RAG (Retrieval-Augmented Generation) pipeline. This ensures high-quality, context-aware responses grounded in your document content.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-open' : ''}`}>
      <button className="faq-trigger" onClick={onToggle}>
        <span className="faq-question">{faq.question}</span>
        <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'faq-chevron-open' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq-answer-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="faq-answer">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="faq section-padding">
      <div className="section-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently asked <span className="gradient-text">questions</span></h2>
          <p className="section-subtitle">Everything you need to know about Clarity AI.</p>
        </motion.div>

        <motion.div
          className="faq-list"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
