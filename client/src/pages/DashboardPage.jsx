import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Clock, Upload, ArrowRight, HelpCircle, FileCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/documentService';
import chatService from '../services/chatService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showToast = false) => {
    try {
      const [docsData, convsData] = await Promise.all([
        documentService.getAllDocuments(),
        chatService.getConversations(),
      ]);
      setDocuments(docsData || []);
      setConversations(convsData?.conversations || []);
      if (showToast) toast.success('Dashboard data updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  // Analytics helper metrics
  const totalDocs = documents.length;
  const readyDocs = documents.filter((doc) => doc.status === 'ready').length;
  const activeChats = conversations.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-welcome">
            Welcome back, <span className="gradient-text">{user?.username || 'User'}</span>!
          </h1>
          <p className="dashboard-sub">Here is what is happening with your documents today.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Stat Cards Grid */}
      <motion.div
        className="dashboard-stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <Card className="stat-card" padding={true}>
            <div className="stat-card-header">
              <div className="stat-card-icon docs-icon">
                <FileText size={20} />
              </div>
              <span className="stat-card-label">Total Documents</span>
            </div>
            <div className="stat-card-value">{loading ? <Skeleton width="60px" height="32px" /> : totalDocs}</div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="stat-card" padding={true}>
            <div className="stat-card-header">
              <div className="stat-card-icon ready-icon">
                <FileCheck size={20} />
              </div>
              <span className="stat-card-label">Processed (Ready)</span>
            </div>
            <div className="stat-card-value">{loading ? <Skeleton width="60px" height="32px" /> : readyDocs}</div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="stat-card" padding={true}>
            <div className="stat-card-header">
              <div className="stat-card-icon chat-icon">
                <MessageSquare size={20} />
              </div>
              <span className="stat-card-label">Active Conversations</span>
            </div>
            <div className="stat-card-value">{loading ? <Skeleton width="60px" height="32px" /> : activeChats}</div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Grid: Recent docs + Quick Actions */}
      <div className="dashboard-main-grid">
        {/* Left column: Recent Documents */}
        <div className="dashboard-column-left">
          <Card className="dashboard-section-card" padding={true} hover={false}>
            <div className="dashboard-section-header">
              <h2>Recent Documents</h2>
              {documents.length > 5 && (
                <Link to="/app/documents" className="dashboard-view-all">
                  View All <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="dashboard-skeletons">
                <Skeleton height="50px" />
                <Skeleton height="50px" />
                <Skeleton height="50px" />
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                title="No documents yet"
                description="Upload your first PDF document to start chatting with the AI."
                actionLabel="Upload PDF"
                actionIcon={Upload}
                onAction={() => navigate('/app/documents')}
              />
            ) : (
              <div className="dashboard-docs-list">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc._id} className="dashboard-doc-row">
                    <div className="doc-row-info">
                      <FileText size={18} className="doc-row-icon" />
                      <div className="doc-row-details">
                        <span className="doc-row-name" title={doc.originalName}>
                          {doc.originalName}
                        </span>
                        <span className="doc-row-date">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="doc-row-actions">
                      <Badge status={doc.status} />
                      {doc.status === 'ready' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => navigate(`/app/chat/${doc._id}`)}
                        >
                          Chat
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={HelpCircle}
                          onClick={() => navigate(`/app/documents`)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Quick Actions */}
        <div className="dashboard-column-right">
          <Card className="dashboard-section-card" padding={true} hover={false}>
            <div className="dashboard-section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="dashboard-actions-list">
              <Button
                variant="primary"
                fullWidth
                icon={Upload}
                onClick={() => navigate('/app/documents')}
                className="dashboard-action-btn"
              >
                Upload New Document
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={MessageSquare}
                onClick={() => {
                  if (readyDocs > 0) {
                    // Navigate to documents to select which one to chat
                    navigate('/app/documents');
                  } else {
                    toast.error('Please upload a document first');
                  }
                }}
                className="dashboard-action-btn"
              >
                Start Chat Session
              </Button>
              <Button
                variant="ghost"
                fullWidth
                icon={Clock}
                onClick={() => navigate('/app/chat-history')}
                className="dashboard-action-btn"
              >
                View Chat History
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
