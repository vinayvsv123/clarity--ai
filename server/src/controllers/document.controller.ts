import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import DocumentModel from '../models/document.model.js';
import Multer from 'multer';
import {
    processDocument,
    deleteDocument as deleteDocumentService,
} from '../services/document.services.js';
import fs from 'fs/promises';
import path from 'path';

// ─────────────────────────────────────────────────────────────
//  Type Definitions
// ─────────────────────────────────────────────────────────────

/**
 * Extends the default Express Request to include the authenticated
 * user payload that the auth middleware injects after JWT verification.
 */
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
    // Populated by multer middleware on file-upload routes
    file?: Express.Multer.File;
}

/** MIME types accepted for document upload. */
const ALLOWED_MIME_TYPES: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

// ─────────────────────────────────────────────────────────────
//  Helper – Extract & validate authenticated user ID
// ─────────────────────────────────────────────────────────────

/**
 * Pulls the authenticated user ID from the request.
 * Throws a 401 if the user object is missing (middleware not applied
 * or token invalid).
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
//  1. Upload Document
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Accept an uploaded PDF/DOCX file, persist it, and kick off
 *          the document-processing pipeline (text extraction → chunking
 *          → embedding → Pinecone upsert) via the document service.
 * @route   POST /api/documents/upload
 * @access  Private (requires auth middleware)
 */
export const uploadDocument = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const userId = extractUserId(req, res);

        // --- File validation ---------------------------------------------------
        const file = req.file; // populated by multer middleware
        if (!file) {
            res.status(400);
            throw new Error('No file uploaded. Please attach a PDF or DOCX file.');
        }

        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            // Clean up the rejected file from disk
            await fs.unlink(file.path).catch(() => {});
            res.status(400);
            throw new Error(
                `Unsupported file type: "${file.mimetype}". Only PDF and DOCX files are accepted.`
            );
        }

        // --- Delegate to the document processing service -----------------------
        // The service internally handles:
        //   • Text extraction (PDF/DOCX)
        //   • Chunking into manageable segments
        //   • Generating vector embeddings via Gemini
        //   • Upserting vectors to Pinecone
        //   • Creating & updating the MongoDB document record
        const document = await processDocument({
            filePath: file.path,
            userId,
            originalName: file.originalname,
            fileType: file.mimetype,
        });

        // --- Return created document details -----------------------------------
        res.status(201).json(
            new ApiResponse(
                201,
                {
                    _id: document._id,
                    filename: document.filename,
                    originalName: document.originalName,
                    status: document.status,
                    totalChunks: document.totalChunks,
                    createdAt: (document as any).createdAt,
                },
                'Document uploaded and processing initiated'
            )
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  2. Get All Documents
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Retrieve every document belonging to the authenticated user,
 *          sorted by creation date (newest first).
 * @route   GET /api/documents
 * @access  Private
 */
export const getAllDocuments = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const userId = extractUserId(req, res);

        const documents = await DocumentModel.find({ userId })
            .sort({ createdAt: -1 })
            .select('-chunks'); // exclude heavy chunk array from list view

        res.status(200).json(
            new ApiResponse(200, documents, 'Documents retrieved successfully')
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  3. Get Document By ID
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Retrieve a single document by its MongoDB ObjectId.
 *          Verifies existence and ownership before returning.
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const userId = extractUserId(req, res);
        // Express 5 types req.params values as string | string[].
        // Named params (e.g. ':id') are always a single string — cast safely.
        const id = req.params.id as string;

        // Fetch document from MongoDB
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Ownership check – prevent cross-user access
        if (document.userId.toString() !== userId) {
            res.status(403);
            throw new Error('You do not have permission to access this document');
        }

        res.status(200).json(
            new ApiResponse(200, document, 'Document retrieved successfully')
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  4. Get Document Status
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Retrieve the current processing status of a document.
 *          Lightweight endpoint for polling from the client.
 *
 *          Possible statuses:
 *            • uploaded   – file received, processing not yet started
 *            • processing – text extraction / embedding in progress
 *            • ready      – document fully processed and queryable
 *            • failed     – processing encountered an error
 *
 * @route   GET /api/documents/:id/status
 * @access  Private
 */
export const getDocumentStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const userId = extractUserId(req, res);
        // Express 5 types req.params values as string | string[].
        const id = req.params.id as string;

        // Fetch only the fields we need for a minimal response
        const document = await DocumentModel.findById(id).select('status userId');
        if (!document) {
            res.status(404);
            throw new Error('Document not found');
        }

        // Ownership check
        if (document.userId.toString() !== userId) {
            res.status(403);
            throw new Error('You do not have permission to access this document');
        }

        res.status(200).json(
            new ApiResponse(
                200,
                { _id: document._id, status: document.status },
                'Document status retrieved successfully'
            )
        );
    }
);

// ─────────────────────────────────────────────────────────────
//  5. Delete Document
// ─────────────────────────────────────────────────────────────

/**
 * @desc    Permanently delete a document and all associated resources.
 *
 *          Cleanup sequence:
 *            1. Verify document exists and belongs to the current user
 *            2. Delegate to document service → removes MongoDB record
 *               (including embedded chunks) and Pinecone vectors
 *            3. Remove the stored file from the local file system
 *
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const userId = extractUserId(req, res);
        // Express 5 types req.params values as string | string[].
        const id = req.params.id as string;

        // --- Verify existence & ownership before deletion ----------------------
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404);
            throw new Error('Document not found');
        }

        if (document.userId.toString() !== userId) {
            res.status(403);
            throw new Error('You do not have permission to delete this document');
        }

        // --- Delegate to the document service ----------------------------------
        // Handles: MongoDB document + embedded chunks deletion, Pinecone vector cleanup
        await deleteDocumentService(id);

        // --- Remove the stored file from disk ----------------------------------
        try {
            const filePath = path.resolve('uploads', document.filename);
            await fs.unlink(filePath);
        } catch (fileError) {
            // Log but do not fail — DB & vector cleanup already succeeded.
            // The file may have been manually removed or never written to disk.
            console.warn(
                `[DocumentController] Could not delete stored file for document ${id}:`,
                fileError
            );
        }

        res.status(200).json(
            new ApiResponse(200, null, 'Document and all associated data deleted successfully')
        );
    }
);
