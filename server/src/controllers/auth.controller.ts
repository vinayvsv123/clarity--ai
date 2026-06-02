import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Signup 
export const signup = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        res.status(409);
        throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    // Set token as httpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(
        new ApiResponse(201, {
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        }, 'User registered successfully')
    );
});

//  Login
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    // Set token as httpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(
        new ApiResponse(200, {
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        }, 'Login successful')
    );
});

//Logout 
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear the auth cookie
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0), // expire immediately
    });

    res.status(200).json(
        new ApiResponse(200, null, 'Logged out successfully')
    );
});