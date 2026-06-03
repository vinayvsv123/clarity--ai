import express from 'express';
import { uploadDocument , getAllDocuments , getDocumentById , deleteDocument } from '../controllers/document.controller.js';
//import { upload } from '../utils/multer.js';

const router = express.Router();

//router.post('/upload' , upload.single('document') , uploadDocument);
router.get('/' , getAllDocuments);
router.get('/:documentId' , getDocumentById);
router.delete('/:documentId' , deleteDocument);

export default router;