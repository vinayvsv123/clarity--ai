import express from 'express';
import {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    getDocumentStatus,
    deleteDocument,
} from '../controllers/document.controller.js';
import upload from '../middleware/multer.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { uploadLimitMiddleware } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/upload', uploadLimitMiddleware, authMiddleware, upload.single('document'), uploadDocument);

router.get('/',uploadLimitMiddleware, authMiddleware, getAllDocuments);

router.get('/:id/status', authMiddleware, getDocumentStatus);

router.get('/:id', authMiddleware, getDocumentById);

router.delete('/:id',authMiddleware, deleteDocument);

export default router;