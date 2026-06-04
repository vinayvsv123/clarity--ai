import rateLimit from 'express-rate-limit';

export const authLimitMiddleware = rateLimit({
    windowMs: 1 * 60 *1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many Login  from this IP, please try again .'
    }
});


export const uploadLimitMiddleware = rateLimit({
    windowMs: 30 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        success: false,
        message: 'Too many file uploads from this IP, please try again later.'
    }
});

export const chatLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message: 'Too many chat messages from this IP, please try again later.'
    }
});

