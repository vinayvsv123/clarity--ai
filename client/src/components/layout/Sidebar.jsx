import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, FolderOpen, MessageSquare, User, ChevronLeft, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutGrid, path: '/app/dashboard' },
    { label: 'Documents', icon: FolderOpen, path: '/app/documents' },
    { label: 'Chat History', icon: MessageSquare, path: '/app/chat-history' },
    { label: 'Profile', icon: User, path: '/app/profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-header">
        <Link to="/app/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={18} />
          </div>
          {!collapsed && (
            <span className="sidebar-logo-text">
              Clarity<span className="gradient-text">AI</span>
            </span>
          )}
        </Link>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-nav-icon">
                <Icon size={20} />
              </div>
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {isActive && !collapsed && <div className="sidebar-nav-active-indicator" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Section */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
          {!collapsed && (
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{user?.username || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || 'user@example.com'}</span>
            </div>
          )}
        </div>
        
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <div className="sidebar-logout-icon">
            <LogOut size={18} />
          </div>
          {!collapsed && <span className="sidebar-logout-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
