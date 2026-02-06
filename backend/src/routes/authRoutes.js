import express from 'express';
import AuthController from '../controllers/authController.js';
import { authSchemas, validate } from '../middleware/validation.js';

const router = express.Router();

// Register route
router.post(
  '/register',
  validate(authSchemas.register), // Validate input
  AuthController.register
);

// Login route
router.post(
  '/login',
  validate(authSchemas.login), // Validate input
  AuthController.login
);

// Health check route (for testing)
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;