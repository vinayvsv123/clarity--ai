import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import chatService from '../services/chatService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { Mail, Shield, FileText, MessageSquare, LogOut, Award } from 'lucide-react';

import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    documentsCount: 0,
    chatsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, convs] = await Promise.all([
          documentService.getAllDocuments(),
          chatService.getConversations(),
        ]);
        setStats({
          documentsCount: docs?.length || 0,
          chatsCount: convs?.conversations?.length || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="profile-page">
      <div className="profile-grid">
        {/* Profile Card */}
        <Card className="profile-info-card" padding={true} hover={false}>
          <div className="profile-avatar-large">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <h2 className="profile-username">{user?.username || 'User'}</h2>
          <p className="profile-tier-badge">
            <Award size={14} />
            <span>Free Tier Plan</span>
          </p>

          <div className="profile-fields-list">
            <div className="profile-field-row">
              <Mail size={16} className="field-icon" />
              <div className="field-content">
                <span className="field-label">Email Address</span>
                <span className="field-val">{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="profile-field-row">
              <Shield size={16} className="field-icon" />
              <div className="field-content">
                <span className="field-label">Account Role</span>
                <span className="field-val">Standard User</span>
              </div>
            </div>
          </div>

          <Button
            variant="danger"
            fullWidth
            icon={LogOut}
            onClick={handleLogout}
            className="profile-logout-btn"
          >
            Sign Out of Account
          </Button>
        </Card>

        {/* Stats Column */}
        <div className="profile-stats-col">
          <Card className="profile-usage-card" padding={true} hover={false}>
            <h2>Clarity AI Usage Summary</h2>
            <p className="usage-subtitle">Your platform metrics and feature usage limits.</p>

            <div className="usage-stats-grid">
              <div className="usage-stat-box">
                <FileText size={24} className="usage-stat-icon doc-stat" />
                <div className="usage-stat-details">
                  <span className="stat-num">{loading ? <Skeleton width="40px" /> : stats.documentsCount}</span>
                  <span className="stat-desc">Documents Uploaded</span>
                </div>
              </div>

              <div className="usage-stat-box">
                <MessageSquare size={24} className="usage-stat-icon chat-stat" />
                <div className="usage-stat-details">
                  <span className="stat-num">{loading ? <Skeleton width="40px" /> : stats.chatsCount}</span>
                  <span className="stat-desc">Active Chat Sessions</span>
                </div>
              </div>
            </div>

            <div className="limits-section">
              <h3>Resource Usage Limits</h3>
              
              <div className="limit-row">
                <div className="limit-meta">
                  <span>PDF Document Limit</span>
                  <span>{stats.documentsCount} / 20 Files</span>
                </div>
                <div className="limit-bar">
                  <div
                    className="limit-bar-fill"
                    style={{ width: `${Math.min((stats.documentsCount / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="limit-row">
                <div className="limit-meta">
                  <span>Chat Queries Limit</span>
                  <span>Unlimited</span>
                </div>
                <div className="limit-bar">
                  <div className="limit-bar-fill" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
