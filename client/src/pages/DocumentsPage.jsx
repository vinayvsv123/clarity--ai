import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FileText, Search, Upload, Trash2, MessageSquare, AlertCircle, Info } from 'lucide-react';
import documentService from '../services/documentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import './DocumentsPage.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Uploading states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Deleting states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const docs = await documentService.getAllDocuments();
      setDocuments(docs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(true);
  }, [fetchDocuments]);

  // Poll server for status updates if any document is processing
  // Use a ref for fetchDocuments to avoid re-triggering the effect
  const fetchDocumentsRef = useRef(fetchDocuments);
  fetchDocumentsRef.current = fetchDocuments;

  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === 'processing');
    let intervalId;

    if (hasProcessing) {
      intervalId = setInterval(() => {
        fetchDocumentsRef.current(false);
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [documents]);

  // Handle Drag & Drop
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    // File validation size limit (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await documentService.uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });
      toast.success('Document uploaded successfully! Processing started.');
      fetchDocuments(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [fetchDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: uploading,
  });

  // Handle Delete Confirmation
  const openDeleteModal = (doc) => {
    setSelectedDoc(doc);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDoc(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return;
    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter((doc) => doc._id !== selectedDoc._id));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="documents-page">
      {/* Search & Action Toolbar */}
      <div className="toolbar-row">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="documents-grid-layout">
        {/* Left pane: Upload Area */}
        <div className="upload-pane">
          <Card className="upload-card" hover={false}>
            <div className="upload-header">
              <h2>Upload Documents</h2>
              <p>Supports PDF & DOCX up to 10MB</p>
            </div>

            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <Upload size={40} className="dropzone-icon" />
                {isDragActive ? (
                  <p className="dropzone-text gradient-text">Drop the file here...</p>
                ) : (
                  <p className="dropzone-text">
                    Drag & drop file here, or <span className="browse-link">browse</span>
                  </p>
                )}
                <span className="dropzone-sub">Only PDF or DOCX allowed</span>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="upload-progress-container">
                <div className="progress-bar-meta">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right pane: Document List */}
        <div className="list-pane">
          <Card className="documents-list-card" padding={true} hover={false}>
            <div className="list-header">
              <h2>My Documents</h2>
              <span className="doc-count-badge">{filteredDocuments.length} total</span>
            </div>

            {loading ? (
              <div className="documents-list-skeletons">
                <Skeleton height="70px" />
                <Skeleton height="70px" />
                <Skeleton height="70px" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No matching documents' : 'No documents uploaded'}
                description={
                  searchQuery
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by dropping a document in the box on the left.'
                }
              />
            ) : (
              <div className="documents-scroll-list">
                {filteredDocuments.map((doc) => (
                  <div key={doc._id} className="document-list-row">
                    <div className="doc-row-details-group">
                      <div className="doc-icon-box">
                        <FileText size={20} />
                      </div>
                      <div className="doc-text-meta">
                        <span className="doc-name" title={doc.originalName}>
                          {doc.originalName}
                        </span>
                        <div className="doc-subtext">
                          <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                          {doc.totalChunks > 0 && (
                            <>
                              <span className="bullet">•</span>
                              <span>{doc.totalChunks} Chunks</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="doc-actions-group">
                      <Badge status={doc.status} />

                      <div className="button-actions">
                        {doc.status === 'ready' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={MessageSquare}
                            onClick={() => navigate(`/app/chat/${doc._id}`)}
                          >
                            Chat
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Info}
                          onClick={() => navigate(`/app/documents/${doc._id}`)}
                          title="View Details"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          className="delete-icon-btn"
                          onClick={() => openDeleteModal(doc)}
                          title="Delete Document"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Document"
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      >
        <div className="delete-modal-content">
          <AlertCircle size={36} className="delete-alert-icon" />
          <p>
            Are you sure you want to delete <strong>{selectedDoc?.originalName}</strong>?
          </p>
          <p className="delete-warning-text">
            This action is permanent. All extracted text, vector chunks in Pinecone, and chat
            history related to this document will be deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
}
