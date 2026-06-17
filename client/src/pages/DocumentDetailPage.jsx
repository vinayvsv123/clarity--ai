import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Shield, MessageSquare, Trash2, HardDrive, Layers } from 'lucide-react';
import documentService from '../services/documentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import './DocumentDetailPage.css';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDocDetails = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await documentService.getDocumentById(id);
      setDoc(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load document details');
      navigate('/app/documents');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDocDetails(true);
  }, [fetchDocDetails]);

  // Polling for processing status
  useEffect(() => {
    let intervalId;
    if (doc && doc.status === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const statusData = await documentService.getDocumentStatus(id);
          if (statusData && statusData.status !== 'processing') {
            fetchDocDetails(false);
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [doc, id, fetchDocDetails]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted successfully');
      navigate('/app/documents');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete document');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };



  if (loading) {
    return (
      <div className="doc-detail-loading">
        <ArrowLeft size={16} />
        <Skeleton width="150px" height="24px" className="mb-4" />
        <Card className="p-8">
          <Skeleton height="32px" width="60%" className="mb-4" />
          <Skeleton height="20px" width="40%" className="mb-6" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </div>
        </Card>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="doc-detail-page">
      {/* Back button */}
      <Link to="/app/documents" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Documents</span>
      </Link>

      {/* Main Details Panel */}
      <div className="doc-detail-layout">
        <div className="doc-detail-main">
          <Card className="doc-detail-card" padding={true} hover={false}>
            <div className="doc-detail-header-row">
              <div className="doc-detail-logo-box">
                <FileText size={32} />
              </div>
              <div className="doc-detail-title-block">
                <h1 className="doc-detail-title" title={doc.originalName}>
                  {doc.originalName}
                </h1>
                <div className="doc-detail-badge-group">
                  <Badge status={doc.status} />
                  <span className="doc-detail-id-label">ID: {doc._id}</span>
                </div>
              </div>
            </div>

            <div className="doc-metadata-grid">
              <div className="metadata-item">
                <HardDrive size={18} className="metadata-icon" />
                <div className="metadata-content">
                  <span className="metadata-label">File Name</span>
                  <span className="metadata-value">{doc.filename || 'N/A'}</span>
                </div>
              </div>

              <div className="metadata-item">
                <Shield size={18} className="metadata-icon" />
                <div className="metadata-content">
                  <span className="metadata-label">File Type</span>
                  <span className="metadata-value">
                    {doc.fileType === 'application/pdf' ? 'PDF Document' : doc.fileType || 'DOCX Document'}
                  </span>
                </div>
              </div>

              <div className="metadata-item">
                <Calendar size={18} className="metadata-icon" />
                <div className="metadata-content">
                  <span className="metadata-label">Uploaded On</span>
                  <span className="metadata-value">
                    {new Date(doc.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="metadata-item">
                <Layers size={18} className="metadata-icon" />
                <div className="metadata-content">
                  <span className="metadata-label">Pinecone Vectors</span>
                  <span className="metadata-value">
                    {doc.totalChunks > 0 ? `${doc.totalChunks} Chunks (Embedded)` : 'Not chunked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="doc-detail-actions-footer">
              <div className="action-buttons-group">
                {doc.status === 'ready' && (
                  <Button
                    variant="primary"
                    icon={MessageSquare}
                    onClick={() => navigate(`/app/chat/${doc._id}`)}
                  >
                    Open Chat Session
                  </Button>
                )}
                <Button
                  variant="danger-ghost"
                  icon={Trash2}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Document
                </Button>
              </div>
            </div>
          </Card>

          {/* RAG pipeline visualization helper card */}
          <Card className="rag-pipeline-card" padding={true} hover={false}>
            <h2>Document Vectorization Pipeline</h2>
            <p className="rag-pipeline-intro">
              Here is how Clarity AI processed this document to enable context-aware discussions:
            </p>

            <div className="pipeline-steps">
              <div className="pipeline-step">
                <div className="pipeline-step-num">1</div>
                <div className="pipeline-step-text">
                  <h3>Document Upload</h3>
                  <p>Secure file ingestion and MIME validation checks (PDF/DOCX checks).</p>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-num">2</div>
                <div className="pipeline-step-text">
                  <h3>Text Extraction & Chunking</h3>
                  <p>
                    Parsing raw character data and splitting paragraphs into semantic chunks to fit
                    LLM context limits.
                  </p>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-num">3</div>
                <div className="pipeline-step-text">
                  <h3>Embedding Generation</h3>
                  <p>
                    Converting text chunks into high-dimensional vector representations via Google's Gemini models.
                  </p>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-num">4</div>
                <div className="pipeline-step-text">
                  <h3>Vector Ingestion</h3>
                  <p>Upserting vectors to a serverless Pinecone index for instant semantic lookup queries.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document"
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      >
        <div className="delete-modal-content">
          <Trash2 size={36} className="delete-alert-icon" />
          <p>
            Are you sure you want to permanently delete <strong>{doc.originalName}</strong>?
          </p>
          <p className="delete-warning-text">
            All database index records, uploaded files on the server's storage, and Pinecone vectors will be erased.
          </p>
        </div>
      </Modal>
    </div>
  );
}
