// backend/src/services/roleMatchingService.js
// ─────────────────────────────────────────────────────────────────────────────
// ML-inspired role matching using TF-IDF vectorization + cosine similarity.
//
// WHY TF-IDF + COSINE?
//  - TF-IDF rewards terms that are relevant to a role and rare across all roles
//    (e.g., "redux" is specific to frontend; "git" appears everywhere → lower weight)
//  - Cosine similarity is scale-invariant: a short skills list vs a long resume
//    doesn't unfairly penalize the score
//  - It's deterministic + explainable: same input → same output, always
//
// SECTION WEIGHTS (simulates importance ranking):
//  skills.technical → 3x  (most direct signal)
//  skills.soft      → 1x
//  project text     → 2x  (shows applied knowledge)
//  education achiev → 1x  (often contains skill mentions)
//  summary          → 1x
// ─────────────────────────────────────────────────────────────────────────────

import natural from 'natural';
import { roles } from '../utils/rolesDataset.js';
import {
  normalizeSkill,
  normalizeSkillArray,
  extractSkillsFromText,
} from './skillNormalizer.js';

const tokenizer = new natural.WordTokenizer();

// ── Text extraction ───────────────────────────────────────────────────────────

/**
 * Build a weighted text corpus from the resume content.
 * Higher-weight sections are repeated so TF-IDF assigns them more influence.
 */
function buildWeightedResumeCorpus(resumeContent) {
  const parts = [];

  // --- Skills (weight: 3x) ---
  const technicalSkills = normalizeSkillArray(resumeContent.skills?.technical || []);
  const softSkills      = normalizeSkillArray(resumeContent.skills?.soft || []);
  const langSkills      = normalizeSkillArray(resumeContent.skills?.languages || []);
  const allSkillText    = [...technicalSkills, ...softSkills, ...langSkills].join(' ');

  // Repeat 3x to give skills 3x TF weight
  for (let i = 0; i < 3; i++) parts.push(allSkillText);

  // --- Projects (weight: 2x) ---
  const projectText = (resumeContent.projects || [])
    .map(p => `${p.description || ''} ${(p.technologies || []).join(' ')} ${p.name || ''}`)
    .join(' ');
  for (let i = 0; i < 2; i++) parts.push(projectText.toLowerCase());

  // --- Education achievements (weight: 1x) ---
  // Skills are often buried here in the parsed format (e.g. "Frontend: HTML, CSS, React")
  const eduText = (resumeContent.education || [])
    .map(e => [
      e.degree || '',
      e.field || '',
      ...(e.achievements || []),
    ].join(' '))
    .join(' ');
  parts.push(eduText.toLowerCase());

  // --- Summary (weight: 1x) ---
  if (resumeContent.personal?.summary) {
    parts.push(resumeContent.personal.summary.toLowerCase());
  }

  return parts.join(' ');
}

/**
 * Extract the full set of skills the candidate actually has.
 * Combines explicit skills arrays + mined skills from text.
 */
function extractCandidateSkills(resumeContent) {
  const skillSet = new Set();

  // 1. Explicit skills arrays
  [
    ...(resumeContent.skills?.technical || []),
    ...(resumeContent.skills?.soft || []),
    ...(resumeContent.skills?.languages || []),
  ].forEach(s => {
    if (s) skillSet.add(normalizeSkill(s));
  });

  // 2. Mine from project descriptions + technologies
  const projectText = (resumeContent.projects || [])
    .map(p => `${p.description || ''} ${(p.technologies || []).join(' ')}`)
    .join(' ');
  extractSkillsFromText(projectText).forEach(s => skillSet.add(s));

  // 3. Mine from education achievements
  // Handles the "Frontend: HTML, CSS, React" pattern in the parsed format
  const eduText = (resumeContent.education || [])
    .map(e => (e.achievements || []).join(' '))
    .join(' ');
  extractSkillsFromText(eduText).forEach(s => skillSet.add(s));

  // 4. Also parse comma-separated skill lines from edu achievements
  // e.g. "Frontend:   HTML, CSS,   React" → ["html", "css", "react"]
  const colonPattern = /(?:frontend|backend|database|others?|tools?|skills?):\s*([^\n]+)/gi;
  let match;
  while ((match = colonPattern.exec(eduText)) !== null) {
    match[1].split(',').forEach(token => {
      const normalized = normalizeSkill(token.trim());
      if (normalized.length > 1) skillSet.add(normalized);
    });
  }

  // Remove noise tokens
  const noiseTokens = new Set(['and', 'the', 'for', 'with', 'using', 'via', 'our', 'result', 'major', 'science']);
  noiseTokens.forEach(n => skillSet.delete(n));

  return skillSet;
}

// ── TF-IDF Engine ─────────────────────────────────────────────────────────────

/**
 * Tokenize text into normalized lowercase tokens (no stopwords, min length 2).
 */
function tokenize(text) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'using', 'via', 'from', 'are', 'was',
    'our', 'have', 'has', 'had', 'this', 'that', 'into', 'its', 'their',
    'who', 'how', 'what', 'when', 'all', 'also', 'more', 'some', 'can',
  ]);
  return tokenizer
    .tokenize(text.toLowerCase())
    .filter(t => t.length >= 2 && !stopWords.has(t));
}

/**
 * Build a TF (term frequency) map from a token array.
 */
function buildTF(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  // Normalize by document length
  const total = tokens.length || 1;
  for (const token in tf) tf[token] /= total;
  return tf;
}

/**
 * Compute IDF for each term across all documents.
 * IDF(t) = log(N / df(t)) where df = number of docs containing term
 */
function buildIDF(allDocTokens) {
  const N = allDocTokens.length;
  const df = {};

  for (const tokens of allDocTokens) {
    const unique = new Set(tokens);
    for (const token of unique) {
      df[token] = (df[token] || 0) + 1;
    }
  }

  const idf = {};
  for (const token in df) {
    idf[token] = Math.log(N / df[token]) + 1; // +1 smoothing
  }
  return idf;
}

/**
 * Compute TF-IDF vector for a document given its TF and the shared IDF.
 */
function buildTFIDFVector(tf, idf) {
  const vector = {};
  for (const token in tf) {
    vector[token] = tf[token] * (idf[token] || 1);
  }
  return vector;
}

/**
 * Cosine similarity between two sparse TF-IDF vectors.
 */
function cosineSimilarity(vecA, vecB) {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const term of allTerms) {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot  += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── Career Trajectory Analysis ────────────────────────────────────────────────

/**
 * Detect the candidate's career trajectory signal from resume content.
 * Returns a qualitative label for the AI explanation layer.
 */
function detectTrajectory(candidateSkills, topRoles) {
  const hasFrontend = topRoles.some(r => r.id === 'frontend-dev' && r.score >= 40);
  const hasBackend  = topRoles.some(r => r.id === 'backend-dev' && r.score >= 40);
  const hasML       = topRoles.some(r => r.id === 'ml-engineer' && r.score >= 35);

  if (hasML) return 'AI/ML Track';
  if (hasFrontend && hasBackend) return 'Full Stack Track';
  if (hasFrontend) return 'Frontend Track';
  if (hasBackend) return 'Backend Track';
  return 'General Engineering Track';
}

// ── Main Matching Function ────────────────────────────────────────────────────

/**
 * Match a resume against all roles.
 *
 * @param {Object} resumeContent - Parsed resume JSON (Resume.content from DB)
 * @param {Object} options
 * @param {number} options.topN      - Number of top roles to return (default 5)
 * @param {number} options.minScore  - Minimum score threshold 0-100 (default 15)
 * @returns {Object} { matches, trajectory, candidateSkills }
 */
export function matchResumeToRoles(resumeContent, options = {}) {
  const { topN = 5, minScore = 15 } = options;

  // 1. Build resume corpus and extract candidate skills
  const resumeCorpus   = buildWeightedResumeCorpus(resumeContent);
  const candidateSkills = extractCandidateSkills(resumeContent);

  // 2. Tokenize all documents: resume + all role skill lists
  const resumeTokens = tokenize(resumeCorpus);
  const roleTokensMap = roles.map(role => ({
    role,
    tokens: tokenize(role.skills.join(' ')),
  }));

  // 3. Build IDF across all documents (resume + all roles)
  const allDocTokens = [resumeTokens, ...roleTokensMap.map(r => r.tokens)];
  const idf = buildIDF(allDocTokens);

  // 4. Build TF-IDF vector for resume
  const resumeTF     = buildTF(resumeTokens);
  const resumeVector = buildTFIDFVector(resumeTF, idf);

  // 5. Score each role
  const scoredRoles = roleTokensMap.map(({ role, tokens }) => {
    const roleTF     = buildTF(tokens);
    const roleVector = buildTFIDFVector(roleTF, idf);

    // Raw cosine similarity (0–1)
    const rawSimilarity = cosineSimilarity(resumeVector, roleVector);

    // Normalize to 0–100 and apply a calibration curve
    // Raw cosine for text is often in 0.05–0.6 range; stretch it meaningfully
    const baseScore = Math.round(rawSimilarity * 100);

    // Bonus: add points for each core skill the candidate has (up to +20)
    const normalizedCoreSkills = role.coreSkills.map(normalizeSkill);
    const coreSkillMatches = normalizedCoreSkills.filter(cs =>
      candidateSkills.has(cs) || resumeCorpus.includes(cs)
    );
    const coreBonus = Math.round((coreSkillMatches.length / Math.max(normalizedCoreSkills.length, 1)) * 20);

    const finalScore = Math.min(baseScore + coreBonus, 99); // cap at 99 (100 is perfect)

    // Matched and missing skills for this role
    const normalizedRoleSkills = role.skills.map(normalizeSkill);
    const matchedSkills = normalizedRoleSkills.filter(
      rs => candidateSkills.has(rs) || resumeCorpus.includes(rs)
    );
    const missingSkills = normalizedRoleSkills.filter(
      rs => !candidateSkills.has(rs) && !resumeCorpus.includes(rs)
    );

    // Priority missing skills: those that appear in coreSkills first
    const priorityMissing = [
      ...missingSkills.filter(s => normalizedCoreSkills.includes(s)),
      ...missingSkills.filter(s => !normalizedCoreSkills.includes(s)),
    ].slice(0, 6); // Show top 6 missing skills

    return {
      id:             role.id,
      role:           role.role,
      emoji:          role.emoji,
      category:       role.category,
      score:          finalScore,
      matchedSkills:  matchedSkills.slice(0, 8), // top 8 matched
      missingSkills:  priorityMissing,
      description:    role.description,
      avgSalary:      role.avgSalary,
      demand:         role.demand,
      growthPath:     role.growthPath,
    };
  });

  // 6. Filter, sort, and return top N
  const topMatches = scoredRoles
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  // 7. Trajectory detection
  const trajectory = detectTrajectory(candidateSkills, topMatches);

  return {
    matches:         topMatches,
    trajectory,
    candidateSkills: [...candidateSkills],
    totalRolesAnalyzed: roles.length,
  };
}
