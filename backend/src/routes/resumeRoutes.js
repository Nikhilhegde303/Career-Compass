import express from 'express';
import multer from 'multer';
import resumeController from '../controllers/resumeController.js';
import resumeUploadController from '../controllers/resumeUploadController.js';
import authMiddleware  from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

// Upload endpoint - multer BEFORE auth middleware
router.post('/upload', upload.single('resume'), authMiddleware, resumeUploadController.uploadResume);

// All other resume routes require authentication
router.use(authMiddleware);

// Existing CRUD operations
router.post('/', resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.post('/:id/duplicate', resumeController.duplicateResume);

export default router;