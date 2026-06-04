import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';


const UPLOADS_DIR = path.resolve('uploads');

// Ensure the uploads directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`[Multer] Created uploads directory at: ${UPLOADS_DIR}`);
}


const ALLOWED_MIME_TYPES: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];




const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
    },
});


const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true); // accept
    } else {
        cb(
            new Error(
                `Unsupported file type: "${file.mimetype}". Only PDF and DOCX files are accepted.`
            )
        );
    }
};


const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    },
});

export default upload;
