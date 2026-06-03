import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import DocumentModel from '../models/document.model.js';
import * as chatService from '../services/chat.services.js';

// ─────────────────────────────────────────────────────────────
//  Type Definitions
// ─────────────────────────────────────────────────────────────

/**
 * Extends the default Express Request to include the authenticated
 * user payload that the auth middleware injects after JWT verification.
 *
 * The `user` property is optional because the middleware may not have
 * run (e.g. misconfigured route), and the controller must handle
 * that case gracefully via `extractUserId`.
 */
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

// ─────────────────────────────────────────────────────────────
//  Helper – Extract & validate authenticated user ID
// ─────────────────────────────────────────────────────────────

/**
 * Pulls the authenticated user ID from the request object.
 * Throws a 401 if the user payload is missing — meaning the auth
 * middleware either didn't run or the token was invalid/expired.
 */
const extractUserId = (req: AuthRequest, res: Response): string => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error('Authentication required. Please log in.');
    }
    return userId;
};

// ─────────────────────────────────────────────────────────────
//  Helper – Verify document ownership
// ─────────────────────────────────────────────────────────────

/**
 * Fetches a document by its ID from MongoDB and verifies that it
 * belongs to the currently authenticated user.
 *
 * This is called before every document-scoped operation to prevent
 * unauthorized cross-user access (IDOR protection).
 *
 * @param documentId - MongoDB ObjectId of the document
 * @param userId     - Authenticated user's ID from the JWT payload
 * @param res        - Express response (used to set status code on failure)
 * @returns          The verified document from MongoDB
 * @throws           404 if the document doesn't exist
 * @throws           403 if the document belongs to a different user
 */
const verifyDocumentOwnership = async (
    documentId: string,
    userId: string,
    res: Response
) => {
    // Validate that documentId was provided
    if (!documentId) {
        res.status(400);
        throw new Error('Document ID is required.');
    }

    // Fetch the document from MongoDB
    const document = await DocumentModel.findById(documentId);

    // Check existence
    if (!document) {
        res.status(404);
        throw new Error('Document not found.');
    }

    // Ownership check – compare the document's userId with the requester's
    if (document.userId.toString() !== userId) {
        res.status(403);
        throw new Error('You do not have permission to access this document.');
    }

    return document;
};

// ─────────────────────────────────────────────────────────────
//  1. Ask Question
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Accept a question about a specific document, retrieve
 *          relevant context via RAG (Retrieval-Augmented Generation),
 *          generate an AI answer using Gemini, and persist the
 *          conversation in chat history.
 *
 * @route   POST /api/chat/ask
 * @access  Private (requires auth middleware)
 *
 * @body    {
 *            "documentId": "mongo_document_id",
 *            "question": "What are the termination clauses?"
 *          }
 *
 * @returns {
 *            "success": true,
 *            "answer": "...",
 *            "sources": [...]
 *          }
 */
export const askQuestion = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        // ── Step 1: Authenticate the user ──────────────────────────
        const userId = extractUserId(req, res);

        // ── Step 2: Validate request body ──────────────────────────
        const { documentId, question } = req.body;

        if (!documentId) {
            res.status(400);
            throw new Error('documentId is required.');
        }

        if (!question || typeof question !== 'string' || question.trim() === '') {
            res.status(400);
            throw new Error('A valid question is required.');
        }

        // ── Step 3: Verify document ownership ──────────────────────
        // Ensures the document exists AND belongs to the authenticated user
        await verifyDocumentOwnership(documentId, userId, res);

        // ── Step 4: Delegate to chatService for all business logic ─
        // The service handles:
        //   • Generating embeddings for the question
        //   • Querying Pinecone for relevant vector matches
        //   • Retrieving chunk texts from MongoDB
        //   • Generating the AI answer via Gemini LLM
        //   • Persisting the conversation in chat history
        const chatResponse = await chatService.askQuestion({
            userId,
            documentId,
            question: question.trim(),
        });

        // ── Step 5: Return the AI response to the client ───────────
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    answer: chatResponse.answer,
                    sources: chatResponse.sourcesUsed,
                    chatHistoryId: chatResponse.chatHistoryId,
                },
                'Question answered successfully'
            )
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  2. Get Chat History
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Retrieve the full chat history for a specific document
 *          belonging to the authenticated user. Results are sorted
 *          newest first (by message timestamp).
 *
 * @route   GET /api/chat/history/:documentId
 * @access  Private (requires auth middleware)
 *
 * @returns {
 *            "success": true,
 *            "history": [...]
 *          }
 */
export const getChatHistory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        // ── Step 1: Authenticate the user ──────────────────────────
        const userId = extractUserId(req, res);

        // ── Step 2: Extract documentId from route params ───────────
        // Express 5 types params as string | string[]; our named param
        // ':documentId' is always a single segment, so we cast safely.
        const documentId = req.params.documentId as string;

        // ── Step 3: Verify document ownership ──────────────────────
        // Prevents users from reading chat history of documents
        // that don't belong to them
        await verifyDocumentOwnership(documentId, userId, res);

        // ── Step 4: Delegate to chatService ────────────────────────
        // Fetches the conversation thread from MongoDB, sorted
        // with the newest messages first
        const history = await chatService.getChatHistory(userId, documentId);

        // ── Step 5: Return chat history ────────────────────────────
        res.status(200).json(
            new ApiResponse(
                200,
                { history },
                'Chat history retrieved successfully'
            )
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  3. Delete Chat History
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Permanently delete all chat records associated with a
 *          specific document for the authenticated user. This action
 *          is irreversible.
 *
 * @route   DELETE /api/chat/history/:documentId
 * @access  Private (requires auth middleware)
 *
 * @returns {
 *            "success": true,
 *            "message": "Chat history deleted successfully"
 *          }
 */
export const deleteChatHistory = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        // ── Step 1: Authenticate the user ──────────────────────────
        const userId = extractUserId(req, res);

        // ── Step 2: Extract documentId from route params ───────────
        // Express 5 types params as string | string[]; our named param
        // ':documentId' is always a single segment, so we cast safely.
        const documentId = req.params.documentId as string;

        // ── Step 3: Verify document ownership ──────────────────────
        // Must confirm the document belongs to the user before
        // allowing deletion of its chat history
        await verifyDocumentOwnership(documentId, userId, res);

        // ── Step 4: Delegate to chatService ────────────────────────
        // Removes all chat records tied to this document for the user
        await chatService.deleteChatHistory(userId, documentId);

        // ── Step 5: Return success confirmation ────────────────────
        res.status(200).json(
            new ApiResponse(
                200,
                null,
                'Chat history deleted successfully'
            )
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  4. Get Conversations
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Retrieve a summary of all conversations belonging to the
 *          authenticated user. Each conversation includes:
 *            • Document name and ID
 *            • The last message exchanged
 *            • Timestamp of last activity
 *
 *          This is used to populate the sidebar/conversation list
 *          in the client UI.
 *
 * @route   GET /api/chat/conversations
 * @access  Private (requires auth middleware)
 *
 * @returns {
 *            "success": true,
 *            "conversations": [
 *              {
 *                "documentId": "...",
 *                "documentName": "...",
 *                "lastMessage": "...",
 *                "lastActivity": "..."
 *              }
 *            ]
 *          }
 */
export const getConversations = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        // ── Step 1: Authenticate the user ──────────────────────────
        const userId = extractUserId(req, res);

        // ── Step 2: Delegate to chatService ────────────────────────
        // Fetches all conversation threads for the user, then
        // enriches each with document metadata (name, last message)
        const conversations = await chatService.getConversations(userId);

        // ── Step 3: Return conversation summaries ──────────────────
        res.status(200).json(
            new ApiResponse(
                200,
                { conversations },
                'Conversations retrieved successfully'
            )
        );
    }
);
