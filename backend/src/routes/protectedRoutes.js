import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected test endpoint
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    status: 'success',
    message: 'Access granted to protected route',
    data: {
      user: req.user
    }
  });
});

export default router;