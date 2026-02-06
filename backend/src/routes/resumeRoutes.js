import express from 'express';
import resumeController from '../controllers/resumeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All resume routes require authentication
router.use(authMiddleware);

// CRUD operations
router.post('/', resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

// Additional operations
router.post('/:id/duplicate', resumeController.duplicateResume);

export default router;