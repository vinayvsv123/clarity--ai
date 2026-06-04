import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiResponse from '../utils/apiResponse.js';


interface JwtPayload {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
    file?: Express.Multer.File;
}


const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(new ApiResponse(401, null, 'Access denied. No token provided.'));
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json(new ApiResponse(401, null, 'Access denied. Token is missing.'));
        return;
    }

    try {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('[Auth] JWT_SECRET is not defined in environment');
            res.status(500).json(new ApiResponse(500, null, 'Internal server error.'));
            return;
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error: unknown) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json(new ApiResponse(401, null, 'Session expired. Please log in again.'));
            return;
        }

        res.status(403).json(new ApiResponse(403, null, 'Invalid token. Authentication failed.'));
    }
};

export default authMiddleware;
