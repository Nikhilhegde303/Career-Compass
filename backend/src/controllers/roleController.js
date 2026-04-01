// backend/src/controllers/roleController.js
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrates the full Role Matching pipeline:
//   1. Fetch resume from DB
//   2. Run TF-IDF matching engine → top roles
//   3. Fetch job listings per role
//   4. Call AI explanation layer (top 3 roles only)
//   5. Build career summary
//   6. Return complete response
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { matchResumeToRoles } from '../services/roleMatchingService.js';
import { getJobsForRole } from '../services/jobService.js';
import { callGroq } from '../../../AI-services/aiClient.js';
import {
  buildRoleExplanationPrompt,
  buildCareerSummaryPrompt,
} from '../../../AI-services/rolePromptBuilder.js';

const prisma = new PrismaClient();

// ── Helper: call Groq and parse the structured output ─────────────────────────

async function getAIExplanation(promptData) {
  try {
    const response = await callGroq(
      [{ role: 'user', content: promptData.user }],
      { temperature: 0.5, maxTokens: 300, variation: 0 }
    );

    // Parse the structured FIT/GAP/ROADMAP/MOTIVATION format
    const lines   = response.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed  = {};
    const roadmap = [];
    let inRoadmap = false;

    for (const line of lines) {
      if (line.startsWith('FIT:'))          { parsed.fit        = line.replace('FIT:', '').trim();        inRoadmap = false; }
      else if (line.startsWith('GAP:'))     { parsed.gap        = line.replace('GAP:', '').trim();        inRoadmap = false; }
      else if (line.startsWith('ROADMAP:')) { inRoadmap = true;  const r = line.replace('ROADMAP:', '').trim(); if (r) roadmap.push(r); }
      else if (line.startsWith('MOTIVATION:')) { parsed.motivation = line.replace('MOTIVATION:', '').trim(); inRoadmap = false; }
      else if (inRoadmap && line.startsWith('•')) { roadmap.push(line); }
    }

    parsed.roadmap = roadmap;

    // Fallback: if parsing failed, return raw
    if (!parsed.fit && !parsed.gap) {
      return { raw: response, fit: '', gap: '', roadmap: [], motivation: '' };
    }

    return parsed;
  } catch (error) {
    console.error('[roleController] AI explanation failed:', error.message);
    return null; // Graceful degradation — UI shows role data without AI text
  }
}

async function getCareerSummary(params) {
  try {
    const promptData = buildCareerSummaryPrompt(params);
    const response   = await callGroq(
      [{ role: 'user', content: promptData.user }],
      { temperature: 0.5, maxTokens: 150, variation: 0 }
    );
    return response.trim();
  } catch (error) {
    console.error('[roleController] Career summary AI failed:', error.message);
    return null;
  }
}

// ── Main controller ───────────────────────────────────────────────────────────

/**
 * GET /api/roles/match/:resumeId
 * Returns full career intelligence report for a resume.
 */
export async function matchRoles(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId       = req.user.user_id; // ✅ matches your JWT middleware

    // ── Step 1: Fetch resume ──────────────────────────────────────────────
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }
    if (resume.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const resumeContent = resume.content;
    if (!resumeContent) {
      return res.status(400).json({
        error: 'Resume has no parsed content. Please upload and parse your resume first.',
      });
    }

    // ── Step 2: Run TF-IDF matching engine ───────────────────────────────
    const { matches, trajectory, candidateSkills, totalRolesAnalyzed } =
      matchResumeToRoles(resumeContent, { topN: 5, minScore: 10 });

    if (matches.length === 0) {
      return res.status(200).json({
        success:       true,
        message:       'Could not find strong role matches. Try enriching your resume with more skills and project details.',
        roles:         [],
        trajectory,
        careerSummary: null,
      });
    }

    // ── Step 3: Fetch job listings for each matched role ─────────────────
    const rolesWithJobs = await Promise.all(
      matches.map(async (match) => {
        const jobs = await getJobsForRole(match.id, match.role, { limit: 4 });
        return { ...match, jobs };
      })
    );

    // ── Step 4: AI explanations for top 3 roles only ─────────────────────
    const candidateName = resumeContent.personal?.fullName || '';

    const rolesWithAI = await Promise.all(
      rolesWithJobs.map(async (match, index) => {
        if (index >= 3) return { ...match, aiExplanation: null };

        const promptData    = buildRoleExplanationPrompt({
          role:          match.role,
          score:         match.score,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          growthPath:    match.growthPath,
          trajectory,
          candidateName,
        });
        const aiExplanation = await getAIExplanation(promptData);
        return { ...match, aiExplanation };
      })
    );

    // ── Step 5: Career summary ────────────────────────────────────────────
    const careerSummary = await getCareerSummary({
      trajectory,
      topRoles:        rolesWithAI.slice(0, 3).map(r => r.role),
      candidateSkills,
      topScore:        rolesWithAI[0]?.score || 0,
    });

    // ── Step 6: Return response ───────────────────────────────────────────
    return res.status(200).json({
      success:            true,
      resumeId,
      resumeTitle:        resume.title,
      trajectory,
      careerSummary,
      candidateSkills,
      totalRolesAnalyzed,
      roles:              rolesWithAI,
      generatedAt:        new Date().toISOString(),
    });

  } catch (error) {
    console.error('[roleController] matchRoles error:', error);
    next(error);
  }
}

/**
 * GET /api/roles/resumes
 * Returns list of user's resumes for the dropdown selector.
 */
export async function getUserResumes(req, res, next) {
  try {
    const userId = req.user.user_id; // ✅ matches your JWT middleware

    const resumes = await prisma.resume.findMany({
      where:   { user_id: userId },
      select:  { id: true, title: true, created_at: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
    });

    return res.status(200).json({ success: true, resumes });
  } catch (error) {
    console.error('[roleController] getUserResumes error:', error);
    next(error);
  }
}
