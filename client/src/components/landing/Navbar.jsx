import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href) => {
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="navbar-logo-text">Clarity<span className="gradient-text">AI</span></span>
        </Link>

        {/* Center nav links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="navbar-link"
              onClick={() => scrollToSection(link.href)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Sign Up</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="navbar-mobile-menu glass-strong"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="navbar-mobile-link"
                onClick={() => scrollToSection(link.href)}
              >
                {link.label}
              </button>
            ))}
            <div className="navbar-mobile-actions">
              <Link to="/login" onClick={() => setIsMobileOpen(false)}>
                <Button variant="secondary" fullWidth>Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileOpen(false)}>
                <Button variant="primary" fullWidth>Sign Up</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
