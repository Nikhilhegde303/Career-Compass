// backend/src/services/resumeOptimizerService.js

import { callGroq } from '../../../AI-services/aiClient.js';
import {
  buildSummaryPrompt,
  buildExperienceBulletPrompt,
  buildSkillsPrompt,
  buildProjectPrompt,
} from '../../../AI-services/promptBuilder.js';

const WEAK_THRESHOLD = 65;

// ── Section eligibility ───────────────────────────────────────────────────────

export function getEligibleSections(resumeContent, analysis) {
  const eligible = [];

  // Summary
  const summaryText = resumeContent?.personal?.summary?.trim();
  if (summaryText && summaryText.length > 0) {
    const score = analysis?.structure_score ?? 0;
    eligible.push({
      section: 'summary',
      label:   'Professional Summary',
      score,
      reason:  score < WEAK_THRESHOLD
        ? 'Summary could be stronger and more ATS-optimized'
        : 'Good structure — further refinement possible',
      current: summaryText,
    });
  } else {
    eligible.push({
      section:  'summary',
      label:    'Professional Summary',
      score:    0,
      reason:   'No summary found — this is critical for ATS scoring',
      current:  '',
      isEmpty:  true,
    });
  }

  // Experience
  const experience = resumeContent?.experience || [];
  if (experience.length > 0) {
    const score = analysis?.impact_score ?? 0;
    const allBullets = [];
    experience.forEach((exp) => {
      (exp.achievements || []).forEach((a) => {
        if (typeof a === 'string' && a.trim()) {
          allBullets.push({
            expIndex: experience.indexOf(exp),
            text:     a,
            company:  exp.company,
            role:     exp.position,
          });
        }
      });
    });
    if (allBullets.length > 0) {
      eligible.push({
        section:    'experience',
        label:      'Work Experience',
        score,
        reason:     score < WEAK_THRESHOLD
          ? 'Bullets lack impact verbs and measurable achievements'
          : 'Decent impact — can refine further',
        bullets:    allBullets,
        experience,
      });
    }
  }

  // Skills
  const skills    = resumeContent?.skills;
  const hasSkills = skills && (
    (skills.technical?.length > 0) ||
    (skills.soft?.length      > 0) ||
    (skills.languages?.length > 0)
  );
  if (hasSkills) {
    const score = analysis?.skills_score ?? 0;
    eligible.push({
      section: 'skills',
      label:   'Skills',
      score,
      reason:  score < WEAK_THRESHOLD
        ? 'Skills section could be better organized and expanded'
        : 'Good coverage — optimization can add missing keywords',
      current: skills,
    });
  }

  // Projects
  const projects          = resumeContent?.projects || [];
  const projectsWithDesc  = projects.filter((p) => p.description?.trim());
  if (projectsWithDesc.length > 0) {
    const score = analysis?.impact_score ?? 0;
    eligible.push({
      section:  'projects',
      label:    'Projects',
      score,
      reason:   score < WEAK_THRESHOLD
        ? 'Project descriptions lack technical depth and impact'
        : 'Good projects — can sharpen descriptions',
      projects: projectsWithDesc,
    });
  }

  return eligible.sort((a, b) => a.score - b.score);
}

// ── Section optimizers ────────────────────────────────────────────────────────

export async function optimizeSummary({
  resumeContent, analysis, jobDescription, jobRole, mode, variation = 0,
}) {
  const currentSummary  = resumeContent?.personal?.summary || '';
  const missingKeywords = analysis?.missing_keywords || [];

  const prompt = buildSummaryPrompt({
    currentSummary: currentSummary || generateSummaryHint(resumeContent),
    missingKeywords,
    jobRole,
    jobDescription,
    mode,
    variation,
  });

  const result = await callGroq(
    [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    { temperature: 0.5, maxTokens: 350, variation }
  );

  return { section: 'summary', original: currentSummary, optimized: result, field: 'personal.summary' };
}

export async function optimizeExperienceBullet({
  resumeContent, analysis, bulletIndex, jobDescription, mode, variation = 0,
}) {
  const experience      = resumeContent?.experience || [];
  const missingKeywords = analysis?.missing_keywords || [];

  const allBullets = [];
  experience.forEach((exp, eIdx) => {
    (exp.achievements || []).forEach((a, aIdx) => {
      if (typeof a === 'string' && a.trim()) {
        allBullets.push({ text: a, expIndex: eIdx, achIndex: aIdx, company: exp.company, role: exp.position });
      }
    });
  });

  if (bulletIndex >= allBullets.length) throw new Error(`Bullet index ${bulletIndex} out of range`);
  const target = allBullets[bulletIndex];

  const prompt = buildExperienceBulletPrompt({
    bullet: target.text, company: target.company, role: target.role,
    missingKeywords, jobDescription, mode, variation,
  });

  const result = await callGroq(
    [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    { temperature: 0.5, maxTokens: 220, variation }
  );

  return {
    section: 'experience', original: target.text, optimized: result,
    expIndex: target.expIndex, achIndex: target.achIndex,
    field: `experience.${target.expIndex}.achievements.${target.achIndex}`,
  };
}

export async function optimizeSkills({
  resumeContent, analysis, jobDescription, mode, variation = 0,
}) {
  const currentSkills   = resumeContent?.skills || {};
  const missingKeywords = analysis?.missing_keywords || [];

  const prompt = buildSkillsPrompt({ currentSkills, missingKeywords, jobDescription, mode, variation });

  const rawResult = await callGroq(
    [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    { temperature: 0.3, maxTokens: 500, variation }
  );

  let parsedSkills;
  try {
    const cleaned = rawResult.replace(/```json|```/g, '').trim();
    parsedSkills  = JSON.parse(cleaned);
    if (!Array.isArray(parsedSkills.technical)) parsedSkills.technical = currentSkills.technical || [];
    if (!Array.isArray(parsedSkills.soft))       parsedSkills.soft      = currentSkills.soft      || [];
    if (!Array.isArray(parsedSkills.languages))  parsedSkills.languages = currentSkills.languages || [];
  } catch {
    throw new Error('AI returned invalid skills format. Please try again.');
  }

  return {
    section: 'skills', original: JSON.stringify(currentSkills),
    optimized: JSON.stringify(parsedSkills), field: 'skills', parsedValue: parsedSkills,
  };
}

export async function optimizeProject({
  resumeContent, analysis, projectIndex, jobDescription, mode, variation = 0,
}) {
  const projects        = resumeContent?.projects || [];
  const missingKeywords = analysis?.missing_keywords || [];

  if (projectIndex >= projects.length) throw new Error(`Project index ${projectIndex} out of range`);
  const project = projects[projectIndex];

  const prompt = buildProjectPrompt({
    projectName: project.name || 'Project', description: project.description || '',
    technologies: project.technologies || [], missingKeywords, mode, variation,
  });

  const result = await callGroq(
    [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }],
    { temperature: 0.5, maxTokens: 300, variation }
  );

  return {
    section: 'projects', original: project.description || '', optimized: result,
    projectIndex, field: `projects.${projectIndex}.description`,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateSummaryHint(content) {
  const parts = [];
  if (content?.personal?.fullName) parts.push(`Name: ${content.personal.fullName}`);
  if (content?.education?.length > 0) {
    const edu = content.education[0];
    parts.push(`Education: ${[edu.degree, edu.field, edu.institution].filter(Boolean).join(' in ')}`);
  }
  if (content?.skills?.technical?.length > 0) {
    parts.push(`Key technical skills: ${content.skills.technical.slice(0, 6).join(', ')}`);
  }
  if (content?.experience?.length > 0) {
    parts.push(`Work experience: ${content.experience.length} role(s)`);
  }
  if (content?.projects?.length > 0) {
    parts.push(`Projects: ${content.projects.map((p) => p.name).filter(Boolean).slice(0, 3).join(', ')}`);
  }
  return parts.length > 0
    ? `[No summary written. Candidate profile: ${parts.join('. ')}]`
    : '[No summary written yet]';
}
