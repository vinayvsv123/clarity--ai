import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Trash2, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import chatService from '../services/chatService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import './ChatHistoryPage.css';

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await chatService.getConversations();
      // Extract the conversations list from the returned object wrapper
      setConversations(response?.conversations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversation history');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  const openDeleteModal = (conv, e) => {
    e.stopPropagation(); // Avoid triggering card navigation click
    setSelectedConv(conv);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedConv(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConv) return;
    setDeleting(true);

    try {
      await chatService.deleteChatHistory(selectedConv.documentId);
      toast.success('Chat history cleared successfully');
      setConversations(conversations.filter((c) => c.documentId !== selectedConv.documentId));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to clear chat history');
    } finally {
      setDeleting(false);
    }
  };

  // Filter conversations based on document name
  const filteredConversations = conversations.filter((c) =>
    c.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-history-page">
      {/* Search Input bar */}
      <div className="toolbar-row">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations by document name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="chat-history-card" padding={true} hover={false}>
        <div className="history-card-header">
          <h2>Active Conversations</h2>
          <span className="history-count-badge">{filteredConversations.length} total</span>
        </div>

        {loading ? (
          <div className="history-list-skeletons">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching conversations' : 'No chat sessions found'}
            description={
              searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Upload a document and select "Chat" to start a conversation.'
            }
          />
        ) : (
          <div className="history-scroll-list">
            {filteredConversations.map((conv) => (
              <div
                key={conv.documentId}
                className="history-list-row"
                onClick={() => navigate(`/app/chat/${conv.documentId}`)}
              >
                <div className="history-row-details">
                  <div className="history-icon-box">
                    <MessageSquare size={20} />
                  </div>
                  <div className="history-text-meta">
                    <span className="history-doc-name">{conv.documentName}</span>
                    <p className="history-last-msg" title={conv.lastMessage}>
                      {conv.lastMessage || 'No messages exchanged.'}
                    </p>
                  </div>
                </div>

                <div className="history-actions-group">
                  <span className="history-time-badge">
                    <Clock size={12} />
                    <span>{getRelativeTime(conv.lastActivity)}</span>
                  </span>

                  <div className="history-row-btns">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/chat/${conv.documentId}`);
                      }}
                    >
                      Resume
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="delete-icon-btn"
                      onClick={(e) => openDeleteModal(conv, e)}
                      title="Clear Chat History"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Clear Chat History"
        confirmText="Clear History"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      >
        <div className="delete-modal-content">
          <AlertCircle size={36} className="delete-alert-icon" />
          <p>
            Are you sure you want to clear the conversation history for{' '}
            <strong>{selectedConv?.documentName}</strong>?
          </p>
          <p className="delete-warning-text">
            This operation is permanent. All discussion logs and assistant responses will be erased, but the document vectors will remain.
          </p>
        </div>
      </Modal>
    </div>
  );
}
