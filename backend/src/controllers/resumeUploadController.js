import resumeService from '../services/resumeService.js';
import resumeParserService from '../services/resumeParserService.js';
import AppError from '../utils/appError.js';

class ResumeUploadController {
  async uploadResume(req, res, next) {
    try {
      const userId = req.user.user_id || req.user.id;

      if (!userId) {
        throw new AppError('User ID not found in request', 401);
      }

      // DEBUG: Log what we received
      console.log('File received:', {
        hasFile: !!req.file,
        filename: req.file?.originalname,
        size: req.file?.size,
        mimetype: req.file?.mimetype
      });

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      // Extract text from file
      console.log('Extracting text from file...'); // DEBUG
      const text = await resumeParserService.extractText(req.file);
      console.log('Text extracted, length:', text.length); // DEBUG

      // Parse resume
      console.log('Parsing resume...'); // DEBUG
      const { parsedData, analysis } = resumeParserService.parseResume(text);

      // Create resume in database
      const resume = await resumeService.createResume(userId, {
        title: `${parsedData.personal.fullName || 'Imported'} Resume`,
        templateId: 'modern',
        content: parsedData
      });

      res.status(201).json({
        success: true,
        data: {
          resumeId: resume.id,
          parsedData: resume.content,
          detectedSections: analysis.detectedSections,
          missingSections: analysis.missingSections,
          stats: analysis.stats,
          firstName: analysis.firstName,
          degree: analysis.degree,
          institution: analysis.institution,
          gpa: analysis.gpa,
          topSkills: analysis.topSkills
        }
      });
    } catch (error) {
      console.error('Resume upload failed:', error);
      next(error);
    }
  }
}

export default new ResumeUploadController();