// backend/src/routes/roleRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// Register in your main app.js:
//   import roleRoutes from './routes/roleRoutes.js';
//   app.use('/api/roles', roleRoutes);
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import { matchRoles, getUserResumes } from '../controllers/roleController.js';
import authMiddleware  from '../middleware/authMiddleware.js'; // reuse your existing auth middleware

const router = express.Router();

// All role routes require authentication
router.use(authMiddleware);

// GET /api/roles/resumes  → list user's resumes for the selector dropdown
router.get('/resumes', getUserResumes);

// GET /api/roles/match/:resumeId  → run full career intelligence analysis
router.get('/match/:resumeId', matchRoles);

export default router;
