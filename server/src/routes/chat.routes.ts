import express from 'express';
import {
    askQuestion,
    getChatHistory,
    deleteChatHistory,
    getConversations,
} from '../controllers/chat.controller.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
//  Chat Routes
//
//  All routes below are protected by auth middleware applied
//  at the app level when this router is mounted.
//
//  Base path: /api/chat
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/chat/ask
 * Ask a question about a specific document.
 * Body: { documentId: string, question: string }
 */
router.post('/ask', askQuestion);

/**
 * GET /api/chat/conversations
 * Retrieve all conversation summaries for the authenticated user.
 * Note: This route MUST be defined before '/history/:documentId'
 * to avoid "conversations" being captured as a :documentId param.
 */
router.get('/conversations', getConversations);

/**
 * GET /api/chat/history/:documentId
 * Retrieve full chat history for a specific document.
 */
router.get('/history/:documentId', getChatHistory);

/**
 * DELETE /api/chat/history/:documentId
 * Delete all chat history for a specific document.
 */
router.delete('/history/:documentId', deleteChatHistory);

export default router;
