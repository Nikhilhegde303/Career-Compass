import AuthService from '../services/authService.js';
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError.js';

const prisma = new PrismaClient();

class AuthController {
  // User registration
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // 1. Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }

      // 2. Hash password
      const passwordHash = await AuthService.hashPassword(password);

      // 3. Create user in database - FIXED: use id, not user_id
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
        },
        select: {
          id: true,        // Changed from user_id to id
          email: true,
          name: true,
          role: true,
          created_at: true
        }
      });

      // 4. Generate JWT token
      const token = AuthService.generateToken({
        userId: user.id,    // Use user.id
        email: user.email,
        name: user.name,
        role: user.role
      });

      // 5. Send response with user_id mapped from id
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            user_id: user.id,  // Map id to user_id
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // User login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // 2. Check if user exists
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // 3. Check if account is active
      if (!user.is_active) {
        throw new AppError('Account is deactivated', 401);
      }

      // 4. Compare password
      const isPasswordValid = await AuthService.comparePassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // 5. Update last login time
      await prisma.user.update({
        where: { email },
        data: { last_login_at: new Date() }
      });

      // 6. Generate token - FIXED: use user.id
      const userForToken = {
        userId: user.id,    // Changed from user.user_id to user.id
        email: user.email,
        name: user.name,
        role: user.role
      };

      const token = AuthService.generateToken(userForToken);

      // 7. Send response
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            user_id: user.id,  // Map id to user_id
            email: user.email,
            name: user.name,
            role: user.role
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;