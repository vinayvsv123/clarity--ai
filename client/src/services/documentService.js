import api from './api';

export const documentService = {
  async uploadDocument(file, onProgress) {
    const formData = new FormData();
    formData.append('document', file);

    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  async getAllDocuments() {
    const response = await api.get('/documents');
    return response.data;
  },

  async getDocumentById(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async getDocumentStatus(id) {
    const response = await api.get(`/documents/${id}/status`);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export default documentService;
