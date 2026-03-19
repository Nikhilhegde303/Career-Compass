// backend/src/routes/optimizerRoutes.js

import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getEligibleSectionsHandler,
  optimizeSectionHandler,
  acceptOptimizationHandler,
  getOptimizationHistoryHandler,
} from '../controllers/resumeOptimizerController.js';

const router = Router();

// All optimizer routes require authentication
router.use(authMiddleware);

// Get which sections are eligible for optimization + their scores
// GET /api/optimizer/eligible/:resumeId?analysisId=XXX
router.get('/eligible/:resumeId', getEligibleSectionsHandler);

// Optimize a specific section using AI
// POST /api/optimizer/optimize-section
router.post('/optimize-section', optimizeSectionHandler);

// Accept an AI optimization → writes to resume
// POST /api/optimizer/accept
router.post('/accept', acceptOptimizationHandler);

// Fetch optimization history for a resume
// GET /api/optimizer/history/:resumeId
router.get('/history/:resumeId', getOptimizationHistoryHandler);

export default router;
