// backend/src/controllers/atsController.js

import { PrismaClient } from '@prisma/client';
import { runHealthAnalysis, runJobMatchAnalysis } from '../services/atsAnalysisService.js';
import AppError from '../utils/appError.js';

const prisma = new PrismaClient();

// ─── Helper: load resume and verify ownership ─────────────────────────────────
async function loadResume(resumeId, userId) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume)               throw new AppError('Resume not found', 404);
  if (resume.user_id !== userId) throw new AppError('Not authorized', 403);
  return resume;
}

// ─── POST /api/analysis/resume/:resumeId ─────────────────────────────────────
export async function analyzeResumeHealth(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.user_id;

    const resume = await loadResume(resumeId, userId);
    const result = runHealthAnalysis(resume.content);

    const saved = await prisma.analysis.create({
      data: {
        resume_id:         resumeId,
        user_id:           userId,
        analysis_type:     result.analysis_type,
        overall_score:     result.overall_score,
        structure_score:   result.structure_score,
        skills_score:      result.skills_score,
        impact_score:      result.impact_score,
        keyword_score:     result.keyword_score,
        readability_score: result.readability_score,
        strengths:         result.strengths,
        weaknesses:        result.weaknesses,
        suggestions:       result.suggestions,
        feature_vector:    result.feature_vector,
      },
    });

    res.status(200).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/analysis/job-match/:resumeId ──────────────────────────────────
export async function analyzeJobMatch(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.user_id;
    const { job_description, job_title, company } = req.body;

    if (!job_description || job_description.trim().length < 50) {
      throw new AppError('Please provide a job description (minimum 50 characters)', 400);
    }

    const resume = await loadResume(resumeId, userId);
    const result = runJobMatchAnalysis(resume.content, job_description, job_title, company);

    const saved = await prisma.analysis.create({
      data: {
        resume_id:         resumeId,
        user_id:           userId,
        analysis_type:     result.analysis_type,
        job_description:   result.job_description,
        job_title:         result.job_title,
        company:           result.company,
        overall_score:     result.overall_score,
        match_score:       result.match_score,
        structure_score:   result.structure_score,
        skills_score:      result.skills_score,
        impact_score:      result.impact_score,
        keyword_score:     result.keyword_score,
        readability_score: result.readability_score,
        strengths:         result.strengths,
        weaknesses:        result.weaknesses,
        suggestions:       result.suggestions,
        matched_keywords:  result.matched_keywords,
        missing_keywords:  result.missing_keywords,
        feature_vector:    result.feature_vector,
      },
    });

    res.status(200).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/analysis/:resumeId ─────────────────────────────────────────────
export async function getAnalysisHistory(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.user_id;

    await loadResume(resumeId, userId); // ownership check

    const analyses = await prisma.analysis.findMany({
      where: { resume_id: resumeId },
      orderBy: { created_at: 'desc' },
      take: 10, // last 10 analyses
    });

    res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/analysis/latest/:resumeId ──────────────────────────────────────
export async function getLatestAnalysis(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.user_id;

    await loadResume(resumeId, userId);

    const analysis = await prisma.analysis.findFirst({
      where: { resume_id: resumeId },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: analysis ?? null,
    });
  } catch (err) {
    next(err);
  }
}