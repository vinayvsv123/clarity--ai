import {signup,login,logout} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import express from 'express';
import { authLimitMiddleware } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/signup', authLimitMiddleware, signup);

router.post('/login', authLimitMiddleware, login);

router.post('/logout', authLimitMiddleware, authMiddleware, logout);

export default router;