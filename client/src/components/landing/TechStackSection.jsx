import { motion } from 'framer-motion';
import './TechStackSection.css';

const technologies = [
  { name: 'React', color: '#61DAFB', letter: 'R' },
  { name: 'Node.js', color: '#68A063', letter: 'N' },
  { name: 'Express.js', color: '#FFFFFF', letter: 'Ex' },
  { name: 'MongoDB', color: '#4DB33D', letter: 'M' },
  { name: 'Pinecone', color: '#4AA8D8', letter: 'P' },
  { name: 'Gemini AI', color: '#8B5CF6', letter: 'G' },
  { name: 'RAG Architecture', color: '#F59E0B', letter: 'R' },
];

export default function TechStackSection() {
  return (
    <section className="tech-stack section-padding">
      <div className="section-container">
        <motion.div
          className="tech-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Tech Stack</span>
          <h2 className="section-title">Built with <span className="gradient-text">modern technologies</span></h2>
          <p className="section-subtitle">Enterprise-grade infrastructure for reliability and performance.</p>
        </motion.div>

        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              className="tech-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="tech-icon" style={{ background: `${tech.color}22`, color: tech.color }}>
                {tech.letter}
              </div>
              <span className="tech-name">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
