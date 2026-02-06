import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError.js';

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user in database - FIXED: use id not user_id
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },  // Changed from user_id to id
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true
      }
    });

    // 4. Check if user exists and is active
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.is_active) {
      throw new AppError('User account is deactivated', 401);
    }

    // 5. Attach user to request object (with mapped user_id)
    req.user = {
      user_id: user.id,  // Map id to user_id
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active
    };
    
    // 6. Continue to next middleware/controller
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    
    // Pass other errors
    next(error);
  }
};

export default authMiddleware;