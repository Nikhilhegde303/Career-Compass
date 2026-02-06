import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError.js';

const prisma = new PrismaClient();

class AuthService {
  // Hash password
  static async hashPassword(password) {
    try {
      const saltRounds = 10; // Higher = more secure but slower
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new AppError('Error hashing password', 500);
    }
  }

  // Compare password with hash
  static async comparePassword(password, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new AppError('Error comparing passwords', 500);
    }
  }

  // Generate JWT token
  // Generate JWT token
static generateToken(user) {
  try {
    const payload = {
      userId: user.userId,  // Make sure it's userId (camelCase)
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return token;
  } catch (error) {
    throw new AppError('Error generating token', 500);
  }
}

  // Verify JWT token (for future use in middleware)
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export default AuthService;