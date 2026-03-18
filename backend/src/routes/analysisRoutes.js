// backend/src/routes/analysisRoutes.js

import Router  from 'express';
import  protect  from '../middleware/authMiddleware.js';
import {
  analyzeResumeHealth,
  analyzeJobMatch,
  getAnalysisHistory,
  getLatestAnalysis,
} from '../controllers/atsController.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Resume Health Analysis
router.post('/resume/:resumeId', analyzeResumeHealth);

// Job Match Analysis
router.post('/job-match/:resumeId', analyzeJobMatch);

// Fetch analysis history for a resume
router.get('/:resumeId', getAnalysisHistory);

// Fetch the most recent analysis
router.get('/latest/:resumeId', getLatestAnalysis);

export default router;