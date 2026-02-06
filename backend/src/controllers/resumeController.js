import resumeService from '../services/resumeServices.js';
import AppError from '../utils/appError.js';

class ResumeController {
  /**
   * Create new resume
   * POST /api/resumes
   */
  async createResume(req, res, next) {
    try {
      const userId = req.user.id; // From authMiddleware
      const resume = await resumeService.createResume(userId, req.body);

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all resumes for current user
   * GET /api/resumes
   */
  async getResumes(req, res, next) {
    try {
      const userId = req.user.id;
      const resumes = await resumeService.getUserResumes(userId);

      res.status(200).json({
        success: true,
        data: resumes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single resume by ID
   * GET /api/resumes/:id
   */
  async getResume(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const resume = await resumeService.getResumeById(id, userId);

      res.status(200).json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update resume
   * PUT /api/resumes/:id
   */
  async updateResume(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const resume = await resumeService.updateResume(id, userId, req.body);

      res.status(200).json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete resume
   * DELETE /api/resumes/:id
   */
  async deleteResume(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await resumeService.deleteResume(id, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duplicate resume
   * POST /api/resumes/:id/duplicate
   */
  async duplicateResume(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const resume = await resumeService.duplicateResume(id, userId);

      res.status(201).json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResumeController();