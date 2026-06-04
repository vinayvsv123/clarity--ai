import express from 'express';
import {
    askQuestion,
    getChatHistory,
    deleteChatHistory,
    getConversations,
} from '../controllers/chat.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { chatLimitMiddleware } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/ask', chatLimitMiddleware, authMiddleware, askQuestion);

router.get('/conversations', chatLimitMiddleware, authMiddleware, getConversations);

router.get('/history/:documentId', chatLimitMiddleware, authMiddleware, getChatHistory);

router.delete('/history/:documentId', chatLimitMiddleware, authMiddleware, deleteChatHistory);

export default router;
