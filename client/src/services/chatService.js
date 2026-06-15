import api from './api';

export const chatService = {
  async askQuestion(documentId, question) {
    const response = await api.post('/chat/ask', { documentId, question });
    return response.data;
  },

  async getChatHistory(documentId) {
    const response = await api.get(`/chat/history/${documentId}`);
    return response.data;
  },

  async deleteChatHistory(documentId) {
    const response = await api.delete(`/chat/history/${documentId}`);
    return response.data;
  },

  async getConversations() {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
};

export default chatService;
