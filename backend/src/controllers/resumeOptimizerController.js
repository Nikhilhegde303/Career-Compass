// backend/src/controllers/resumeOptimizerController.js

import { PrismaClient }      from '@prisma/client';
import AppError              from '../utils/appError.js';
import {
  getEligibleSections,
  optimizeSummary,
  optimizeExperienceBullet,
  optimizeSkills,
  optimizeProject,
} from '../services/resumeOptimizerService.js';
import {
  runHealthAnalysis,
  runJobMatchAnalysis,
} from '../services/atsAnalysisService.js';

const prisma = new PrismaClient();

// ── Helper ────────────────────────────────────────────────────────────────────

async function loadResumeAndAnalysis(resumeId, userId, analysisId, jobDescription, mode) {
  // Load and verify resume ownership
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume)                   throw new AppError('Resume not found', 404);
  if (resume.user_id !== userId) throw new AppError('Not authorized', 403);

  let analysis = null;

  // Try loading specific analysis if id provided
  if (analysisId) {
    analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  }

  // Fallback: get most recent analysis for this resume
  if (!analysis) {
    analysis = await prisma.analysis.findFirst({
      where:   { resume_id: resumeId },
      orderBy: { created_at: 'desc' },
    });
  }

  // No analysis exists at all — run one silently so optimizer always has scores
  if (!analysis) {
    let result;

    if (mode === 'job_match' && jobDescription) {
      result = runJobMatchAnalysis(resume.content, jobDescription, '', '');
    } else {
      result = runHealthAnalysis(resume.content);
    }

    analysis = await prisma.analysis.create({
      data: {
        resume_id:         resumeId,
        user_id:           userId,
        analysis_type:     result.analysis_type,
        job_description:   result.job_description   ?? null,
        overall_score:     result.overall_score,
        match_score:       result.match_score        ?? null,
        structure_score:   result.structure_score,
        skills_score:      result.skills_score,
        impact_score:      result.impact_score,
        keyword_score:     result.keyword_score,
        readability_score: result.readability_score,
        strengths:         result.strengths,
        weaknesses:        result.weaknesses,
        suggestions:       result.suggestions,
        matched_keywords:  result.matched_keywords   ?? null,
        missing_keywords:  result.missing_keywords   ?? null,
        feature_vector:    result.feature_vector,
      },
    });
  }

  return { resume, analysis };
}

// ── GET /api/optimizer/eligible/:resumeId ─────────────────────────────────────
// Returns eligible sections + scores.
// If no analysis exists, silently runs a fresh one.

export async function getEligibleSectionsHandler(req, res, next) {
  try {
    const { resumeId }                    = req.params;
    const { analysisId, mode, jobDescription } = req.query;
    const userId                          = req.user.user_id;

    const { resume, analysis } = await loadResumeAndAnalysis(
      resumeId, userId, analysisId, jobDescription, mode || 'health'
    );

    const sections = getEligibleSections(resume.content, analysis);

    res.status(200).json({
      success: true,
      data: {
        resume: {
          id:    resume.id,
          title: resume.title,
        },
        analysis: {
          id:               analysis.id,
          overall_score:    analysis.overall_score,
          match_score:      analysis.match_score,
          analysis_type:    analysis.analysis_type,
          weaknesses:       analysis.weaknesses,
          missing_keywords: analysis.missing_keywords,
          job_description:  analysis.job_description,
          job_title:        analysis.job_title,
        },
        eligibleSections: sections,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/optimizer/optimize-section ─────────────────────────────────────

export async function optimizeSectionHandler(req, res, next) {
  try {
    const userId = req.user.user_id;
    const {
      resumeId,
      analysisId,
      section,
      bulletIndex,
      projectIndex,
      mode          = 'health',
      jobDescription,
      jobRole,
    } = req.body;

    if (!resumeId) throw new AppError('resumeId is required', 400);
    if (!section)  throw new AppError('section is required', 400);

    const validSections = ['summary', 'experience', 'skills', 'projects'];
    if (!validSections.includes(section)) {
      throw new AppError(`Invalid section. Must be one of: ${validSections.join(', ')}`, 400);
    }

    const { resume, analysis } = await loadResumeAndAnalysis(
      resumeId, userId, analysisId, jobDescription, mode
    );
    const content = resume.content;

    let result;
    const commonArgs = { resumeContent: content, analysis, jobDescription, jobRole, mode };

    switch (section) {
      case 'summary':
        result = await optimizeSummary(commonArgs);
        break;
      case 'experience':
        if (bulletIndex === undefined || bulletIndex === null) {
          throw new AppError('bulletIndex is required for experience optimization', 400);
        }
        result = await optimizeExperienceBullet({ ...commonArgs, bulletIndex: Number(bulletIndex) });
        break;
      case 'skills':
        result = await optimizeSkills(commonArgs);
        break;
      case 'projects':
        if (projectIndex === undefined || projectIndex === null) {
          throw new AppError('projectIndex is required for project optimization', 400);
        }
        result = await optimizeProject({ ...commonArgs, projectIndex: Number(projectIndex) });
        break;
    }

    const saved = await prisma.resumeOptimization.create({
      data: {
        resume_id:   resumeId,
        user_id:     userId,
        analysis_id: analysisId || analysis.id,
        section,
        original:    result.original,
        optimized:   result.optimized,
        mode,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        optimizationId: saved.id,
        section,
        original:       result.original,
        optimized:      result.optimized,
        field:          result.field,
        parsedValue:    result.parsedValue  ?? null,
        expIndex:       result.expIndex     ?? null,
        achIndex:       result.achIndex     ?? null,
        projectIndex:   result.projectIndex ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/optimizer/accept ────────────────────────────────────────────────

export async function acceptOptimizationHandler(req, res, next) {
  try {
    const userId             = req.user.user_id;
    const { optimizationId } = req.body;

    if (!optimizationId) throw new AppError('optimizationId is required', 400);

    const optimization = await prisma.resumeOptimization.findUnique({
      where: { id: optimizationId },
    });
    if (!optimization)                   throw new AppError('Optimization not found', 404);
    if (optimization.user_id !== userId) throw new AppError('Not authorized', 403);

    const resume = await prisma.resume.findUnique({ where: { id: optimization.resume_id } });
    if (!resume) throw new AppError('Resume not found', 404);

    const content = JSON.parse(JSON.stringify(resume.content));
    applyOptimization(content, optimization);

    await prisma.resume.update({
      where: { id: resume.id },
      data:  { content, updated_at: new Date() },
    });

    await prisma.resumeOptimization.update({
      where: { id: optimizationId },
      data:  { accepted: true },
    });

    res.status(200).json({
      success: true,
      data: {
        resumeId: resume.id,
        section:  optimization.section,
        message:  'Resume updated successfully',
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/optimizer/history/:resumeId ─────────────────────────────────────

export async function getOptimizationHistoryHandler(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId       = req.user.user_id;

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume)                   throw new AppError('Resume not found', 404);
    if (resume.user_id !== userId) throw new AppError('Not authorized', 403);

    const history = await prisma.resumeOptimization.findMany({
      where:   { resume_id: resumeId },
      orderBy: { created_at: 'desc' },
      take:    20,
    });

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

// ── Helper: apply optimization to resume content ──────────────────────────────

function applyOptimization(content, optimization) {
  const { section, optimized } = optimization;

  switch (section) {
    case 'summary':
      if (!content.personal) content.personal = {};
      content.personal.summary = optimized;
      break;

    case 'skills':
      try {
        const parsed = JSON.parse(optimized);
        content.skills = parsed;
      } catch {
        // Leave unchanged if JSON parse fails
      }
      break;

    case 'experience': {
      const original = optimization.original;
      if (Array.isArray(content.experience)) {
        content.experience.forEach((exp) => {
          if (Array.isArray(exp.achievements)) {
            exp.achievements = exp.achievements.map((a) =>
              a === original ? optimized : a
            );
          }
        });
      }
      break;
    }

    case 'projects': {
      const original = optimization.original;
      if (Array.isArray(content.projects)) {
        content.projects = content.projects.map((p) =>
          p.description === original ? { ...p, description: optimized } : p
        );
      }
      break;
    }
  }
}
