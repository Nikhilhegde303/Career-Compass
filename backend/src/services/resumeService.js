import { PrismaClient } from '@prisma/client';
import AppError from '../utils/appError.js';

const prisma = new PrismaClient();

// Default empty resume content structure
const getEmptyResumeContent = () => ({
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: {
    technical: [],
    soft: [],
    languages: []
  },
  projects: []
});

class ResumeService {
  // Helper to convert snake_case DB fields to camelCase for frontend
  _formatResumeForResponse(resume) {
    return {
      id: resume.id,
      title: resume.title,
      templateId: resume.template_id,
      content: resume.content,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at
    };
  }

  /**
   * Create a new resume for a user
   */
  async createResume(userId, data) {
    const { title, templateId = 'modern', content } = data;

    if (!title || !title.trim()) {
      throw new AppError('Resume title is required', 400);
    }

    const resume = await prisma.resume.create({
      data: {
        user_id: userId,
        title: title.trim(),
        template_id: templateId,
        content: content || getEmptyResumeContent()
      }
    });

    return this._formatResumeForResponse(resume);
  }

  /**
   * Get all resumes for a specific user
   */
  async getUserResumes(userId) {
    const resumes = await prisma.resume.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        title: true,
        template_id: true,
        created_at: true,
        updated_at: true
      }
    });

    return resumes.map(r => this._formatResumeForResponse(r));
  }

  /**
   * Get a single resume by ID
   */
  async getResumeById(resumeId, userId) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.user_id !== userId) {
      throw new AppError('Unauthorized access to this resume', 403);
    }

    return this._formatResumeForResponse(resume);
  }

  /**
   * Update an existing resume
   */
  async updateResume(resumeId, userId, data) {
    await this.getResumeById(resumeId, userId);

    const { title, templateId, content } = data;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (templateId !== undefined) updateData.template_id = templateId;
    if (content !== undefined) updateData.content = content;

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: updateData
    });

    return this._formatResumeForResponse(updatedResume);
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId, userId) {
    await this.getResumeById(resumeId, userId);

    await prisma.resume.delete({
      where: { id: resumeId }
    });

    return { message: 'Resume deleted successfully' };
  }

  /**
   * Duplicate an existing resume
   */
  async duplicateResume(resumeId, userId) {
    const originalResume = await this.getResumeById(resumeId, userId);

    const duplicatedResume = await prisma.resume.create({
      data: {
        user_id: userId,
        title: `${originalResume.title} (Copy)`,
        template_id: originalResume.templateId,
        content: originalResume.content
      }
    });

    return this._formatResumeForResponse(duplicatedResume);
  }
}

export default new ResumeService();