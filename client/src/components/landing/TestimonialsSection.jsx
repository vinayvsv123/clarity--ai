import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import './TestimonialsSection.css';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Research Analyst',
    avatar: 'SC',
    rating: 5,
    text: 'Clarity AI has completely transformed how I handle research papers. What used to take hours of manual searching now takes seconds with incredibly accurate answers.',
  },
  {
    name: 'James Rodriguez',
    role: 'Legal Consultant',
    avatar: 'JR',
    rating: 5,
    text: 'The document Q&A feature is a game-changer for legal review. I can instantly find relevant clauses across hundreds of contract pages.',
  },
  {
    name: 'Emily Watson',
    role: 'Product Manager',
    avatar: 'EW',
    rating: 5,
    text: 'We use Clarity AI to quickly analyze product specs and technical documentation. The source referencing feature gives us confidence in every answer.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="testimonials section-padding">
      <div className="section-container">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Loved by <span className="gradient-text">professionals</span></h2>
          <p className="section-subtitle">See what our users say about their experience with Clarity AI.</p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              className="testimonial-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="testimonial-stars">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
