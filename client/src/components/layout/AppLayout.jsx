import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { AnimatePresence, motion } from 'framer-motion';
import './AppLayout.css';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Mobile Drawer (Portal-like Overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="app-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.div
              className="app-mobile-sidebar glass-strong"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="app-mobile-header">
                <Link to="/app/dashboard" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
                  <div className="sidebar-logo-icon">
                    <Sparkles size={18} />
                  </div>
                  <span className="sidebar-logo-text">
                    Clarity<span className="gradient-text">AI</span>
                  </span>
                </Link>
                <button
                  className="app-mobile-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar internals */}
              <div className="app-mobile-nav-container">
                <Sidebar collapsed={false} setCollapsed={() => {}} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`app-main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar setMobileOpen={setMobileOpen} />
        <main className="app-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
