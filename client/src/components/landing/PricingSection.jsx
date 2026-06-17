import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import './PricingSection.css';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Clarity AI',
    features: [
      '5 document uploads',
      '50 questions per month',
      'Basic chat history',
      'PDF support',
      'Community support',
    ],
    cta: 'Get Started Free',
    variant: 'secondary',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For professionals who need more power',
    features: [
      'Unlimited document uploads',
      'Unlimited questions',
      'Full chat history',
      'PDF & DOCX support',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Start Pro Trial',
    variant: 'primary',
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section className="pricing section-padding">
      <div className="section-container">
        <motion.div
          className="pricing-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Pricing</span>
          <h2 className="section-title">Simple, transparent <span className="gradient-text">pricing</span></h2>
          <p className="section-subtitle">Start free and upgrade when you're ready for more.</p>
        </motion.div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`pricing-card glass-card ${plan.popular ? 'pricing-popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {plan.popular && <div className="pricing-badge">Most Popular</div>}
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <p className="pricing-description">{plan.description}</p>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant={plan.variant} fullWidth size="lg">{plan.cta}</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
