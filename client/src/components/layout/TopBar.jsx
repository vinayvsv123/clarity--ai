import { useLocation, Link } from 'react-router-dom';
import { Menu, User, LogOut, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TopBar.css';

export default function TopBar({ setMobileOpen }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Generate breadcrumbs from path
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';

    const lastSegment = segments[segments.length - 1];
    if (lastSegment === 'dashboard') return 'Dashboard';
    if (lastSegment === 'documents') return 'My Documents';
    if (lastSegment === 'chat-history') return 'Chat History';
    if (lastSegment === 'profile') return 'My Profile';

    // If detail page (e.g. document ID or chat ID)
    if (segments.includes('documents') && lastSegment !== 'documents') {
      return 'Document Details';
    }
    if (segments.includes('chat') && lastSegment !== 'chat') {
      return 'Chat Session';
    }

    return 'Clarity AI';
  };

  return (
    <header className="topbar glass">
      <div className="topbar-left">
        {/* Mobile menu trigger */}
        <button
          className="topbar-mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        {/* Title / Breadcrumbs */}
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">App</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Profile Dropdown */}
        <div className="topbar-profile-container">
          <button
            className="topbar-profile-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="topbar-avatar">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span className="topbar-username">{user?.username || 'User'}</span>
          </button>

          <AnimatePresence>
            {profileDropdownOpen && (
              <>
                {/* Backdrop to close click */}
                <div
                  className="topbar-dropdown-backdrop"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                
                <motion.div
                  className="topbar-dropdown glass-strong"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="dropdown-user-info">
                    <p className="dropdown-name">{user?.username}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/app/profile"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    to="/app/documents"
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <FileText size={16} />
                    <span>My Documents</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item logout-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
