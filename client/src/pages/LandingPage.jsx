import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import TechStackSection from '../components/landing/TechStackSection';
import DemoSection from '../components/landing/DemoSection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--gradient-hero)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />
      <HeroSection />
      
      <div id="features">
        <FeaturesSection />
      </div>
      
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      
      <BenefitsSection />
      <TechStackSection />
      <DemoSection />
      
      <div id="faq">
        <FAQSection />
      </div>
      
      <Footer />
    </div>
  );
}
