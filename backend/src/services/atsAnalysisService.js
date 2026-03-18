// backend/src/services/atsAnalysisService.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure rule-based ATS scoring engine.
// No AI calls here — this runs fast, deterministically, and for free.
// AI enhancement is a separate opt-in layer (Part 3).
// ─────────────────────────────────────────────────────────────────────────────

// ── Industry keyword bank ────────────────────────────────────────────────────
const TECH_KEYWORDS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'react', 'angular', 'vue', 'nextjs', 'nodejs', 'express', 'fastapi', 'django',
  'flask', 'spring', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd',
  'git', 'github', 'gitlab', 'linux', 'rest', 'graphql', 'grpc', 'microservices',
  'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch',
  'data structures', 'algorithms', 'system design', 'agile', 'scrum',
]);

const ACTION_VERBS = new Set([
  'developed', 'built', 'designed', 'implemented', 'architected', 'optimized',
  'reduced', 'improved', 'increased', 'led', 'managed', 'created', 'launched',
  'delivered', 'automated', 'migrated', 'refactored', 'deployed', 'integrated',
  'collaborated', 'mentored', 'researched', 'analyzed', 'engineered', 'resolved',
  'streamlined', 'accelerated', 'established', 'spearheaded', 'transformed',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Flatten resume JSON into a single lowercase string for text analysis.
 */
function flattenResumeToText(content) {
  return JSON.stringify(content).toLowerCase();
}

/**
 * Extract all bullet/description strings from experience and projects.
 */
// ── REPLACE extractBullets() ──────────────────────────────────────────────────
// Old version missed plain string descriptions and empty experience arrays.
// New version collects text from every possible content location.

function extractBullets(content) {
  const bullets = [];

  // Experience achievements (array of strings)
  if (Array.isArray(content.experience)) {
    content.experience.forEach((exp) => {
      if (Array.isArray(exp.achievements)) {
        exp.achievements.forEach((a) => {
          if (typeof a === 'string' && a.trim()) bullets.push(a.toLowerCase());
        });
      }
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((b) => {
          if (typeof b === 'string' && b.trim()) bullets.push(b.toLowerCase());
        });
      }
      if (typeof exp.description === 'string' && exp.description.trim()) {
        bullets.push(exp.description.toLowerCase());
      }
    });
  }

  // Projects — description is a plain string in your schema
  if (Array.isArray(content.projects)) {
    content.projects.forEach((proj) => {
      if (typeof proj.description === 'string' && proj.description.trim()) {
        bullets.push(proj.description.toLowerCase());
      }
      if (Array.isArray(proj.bullets)) {
        proj.bullets.forEach((b) => {
          if (typeof b === 'string' && b.trim()) bullets.push(b.toLowerCase());
        });
      }
      if (Array.isArray(proj.achievements)) {
        proj.achievements.forEach((a) => {
          if (typeof a === 'string' && a.trim()) bullets.push(a.toLowerCase());
        });
      }
    });
  }

  return bullets;
}

/**
 * Collect all skills from the skills object/array.
 */
function extractAllSkills(skillsSection) {
  if (!skillsSection) return [];
  if (Array.isArray(skillsSection)) return skillsSection.map((s) => s.toLowerCase());

  // Handle { technical: [], soft: [], tools: [] } pattern
  const allSkills = [];
  Object.values(skillsSection).forEach((val) => {
    if (Array.isArray(val)) allSkills.push(...val.map((s) => String(s).toLowerCase()));
    if (typeof val === 'string') allSkills.push(val.toLowerCase());
  });
  return allSkills;
}

// ── Score calculators ─────────────────────────────────────────────────────────

/**
 * STRUCTURE SCORE (0–100)
 * Checks presence and quality of each major resume section.
 */
function calcStructureScore(content) {
  const checks = [
    { key: 'personal',   label: 'Personal info',   weight: 20, test: (c) => c.personal && c.personal.name && c.personal.email },
    { key: 'summary',    label: 'Professional summary', weight: 15, test: (c) => c.personal?.summary && c.personal.summary.trim().length > 30 },
    { key: 'education',  label: 'Education',        weight: 15, test: (c) => Array.isArray(c.education) && c.education.length > 0 },
    { key: 'experience', label: 'Experience',       weight: 20, test: (c) => Array.isArray(c.experience) && c.experience.length > 0 },
    { key: 'skills',     label: 'Skills',           weight: 15, test: (c) => c.skills && Object.keys(c.skills).length > 0 || Array.isArray(c.skills) && c.skills.length > 0 },
    { key: 'projects',   label: 'Projects',         weight: 15, test: (c) => Array.isArray(c.projects) && c.projects.length > 0 },
  ];

  let score = 0;
  const missing = [];
  const present = [];

  checks.forEach(({ label, weight, test }) => {
    if (test(content)) {
      score += weight;
      present.push(label);
    } else {
      missing.push(label);
    }
  });

  return { score: Math.min(score, 100), missing, present };
}

/**
 * SKILLS SCORE (0–100)
 * Evaluates skill count, tech diversity, and categorization.
 */
function calcSkillsScore(content) {
  const skills = extractAllSkills(content.skills);
  const count = skills.length;

  // Count how many are recognized tech keywords
  const techCount = skills.filter((s) => TECH_KEYWORDS.has(s)).length;

  // Is skills section categorized (multiple keys)?
  const isCategorized = content.skills && !Array.isArray(content.skills) && Object.keys(content.skills).length >= 2;

  let score = 0;
  score += Math.min(count * 4, 50);          // Up to 50 pts for quantity (12+ skills = full)
  score += Math.min(techCount * 5, 30);      // Up to 30 pts for recognized tech keywords
  score += isCategorized ? 20 : 0;           // 20 pts for categorized structure

  return {
    score: Math.min(score, 100),
    skillCount: count,
    techSkillCount: techCount,
    isCategorized,
  };
}

/**
 * IMPACT SCORE (0–100)
 * Checks for metrics, numbers, percentages, and action verbs in bullets.
 */
// ── REPLACE calcImpactScore() ─────────────────────────────────────────────────
// Old version returned 20 when no bullets found (too harsh).
// New version: if only project descriptions exist, still scores them.
// Also: students rarely have metrics — weight action verbs more.

function calcImpactScore(content) {
  const bullets = extractBullets(content);

  const hasExperience = Array.isArray(content.experience) && content.experience.length > 0;
  const hasProjects   = Array.isArray(content.projects)   && content.projects.length > 0;

  // Nothing to evaluate at all
  if (bullets.length === 0) {
    return { score: 10, bulletsAnalyzed: 0, withMetrics: 0, withActionVerbs: 0 };
  }

  const metricsRegex = /\b\d+\s*(%|x\b|k\b|m\b|ms\b|s\b|percent|times|users|requests|hours|days|lines|features|bugs|clients|projects)/i;

  let withMetrics     = 0;
  let withActionVerbs = 0;

  bullets.forEach((bullet) => {
    if (metricsRegex.test(bullet)) withMetrics++;
    const firstWord = bullet.trim().split(/\s+/)[0].replace(/[^a-z]/g, '');
    if (ACTION_VERBS.has(firstWord)) withActionVerbs++;
  });

  const metricRatio = withMetrics / bullets.length;
  const actionRatio = withActionVerbs / bullets.length;

  // For students: action verbs weighted more (50), metrics weighted less (50)
  // because quantified achievements are rare in student resumes
  let score = Math.round(metricRatio * 50) + Math.round(actionRatio * 50);

  // Bonus: having any project descriptions is better than nothing
  if (hasProjects && !hasExperience) score = Math.max(score, 25);

  // Bonus: having both experience and projects
  if (hasExperience && hasProjects) score = Math.min(score + 10, 100);

  return {
    score: Math.min(Math.max(score, 10), 100),
    bulletsAnalyzed: bullets.length,
    withMetrics,
    withActionVerbs,
  };
}

/**
 * KEYWORD SCORE (0–100)
 * Checks how many recognized tech/industry keywords appear in the resume.
 */
function calcKeywordScore(content) {
  const text = flattenResumeToText(content);
  let found = 0;

  TECH_KEYWORDS.forEach((kw) => {
    if (text.includes(kw)) found++;
  });

  // Scoring: 15 keywords = ~75 pts, 20+ = full
  const score = Math.min(Math.round((found / 20) * 100), 100);
  return { score, keywordsFound: found, totalKeywordsChecked: TECH_KEYWORDS.size };
}

/**
 * READABILITY SCORE (0–100)
 * Checks bullet usage, section balance, and resume length signals.
 */
function calcReadabilityScore(content) {
  const bullets = extractBullets(content);
  const experienceCount = content.experience?.length ?? 0;
  const text = flattenResumeToText(content);

  // Rough word count from JSON
  const wordCount = text.split(/\s+/).length;

  let score = 100;

  // Penalty: too few bullets for experience entries
  if (experienceCount > 0 && bullets.length / experienceCount < 2) score -= 20;

  // Penalty: resume too sparse
  if (wordCount < 200)  score -= 25;

  // Penalty: resume too verbose (JSON word count > 1500 signals wall-of-text risk)
  if (wordCount > 1500) score -= 15;

  // Bonus: healthy bullet count
  if (bullets.length >= 6) score = Math.min(score + 10, 100);

  return { score: Math.max(score, 0), wordCount, bulletCount: bullets.length };
}

// ── Overall score ─────────────────────────────────────────────────────────────

function calcOverallScore({ structure, skills, impact, keyword, readability }) {
  return Math.round(
    structure  * 0.25 +
    skills     * 0.20 +
    impact     * 0.25 +
    keyword    * 0.15 +
    readability * 0.15
  );
}

// ── Insight generators ────────────────────────────────────────────────────────

function generateStrengths(scores, structureDetails, skillsDetails, impactDetails) {
  const strengths = [];

  if (scores.structure >= 80)    strengths.push('Well-structured resume with all major sections present');
  if (scores.skills >= 70)       strengths.push(`Good technical skill coverage (${skillsDetails.skillCount} skills listed)`);
  if (skillsDetails.isCategorized) strengths.push('Skills are neatly categorized for ATS readability');
  if (scores.impact >= 70)       strengths.push('Strong use of impact-driven language and metrics');
  if (impactDetails.withMetrics >= 3) strengths.push('Multiple quantified achievements demonstrate real-world impact');
  if (scores.keyword >= 70)      strengths.push('Good industry keyword coverage improves ATS pass rate');
  if (scores.readability >= 80)  strengths.push('Resume has good length and readability balance');

  return strengths.length > 0 ? strengths : ['Resume has a solid foundation to build upon'];
}

function generateWeaknesses(scores, structureDetails, skillsDetails, impactDetails) {
  const weaknesses = [];

  if (structureDetails.missing.length > 0) {
    weaknesses.push(`Missing sections: ${structureDetails.missing.join(', ')}`);
  }
  if (scores.impact < 50) weaknesses.push('Experience bullets lack measurable achievements and metrics');
  if (impactDetails.withActionVerbs < 3) weaknesses.push('Few action verbs used — bullets feel passive');
  if (scores.skills < 50)  weaknesses.push('Skills section is thin — add more relevant technologies');
  if (!skillsDetails.isCategorized) weaknesses.push('Skills are not categorized — harder for ATS to parse');
  if (scores.keyword < 50) weaknesses.push('Low industry keyword density may cause ATS rejection');
  if (scores.readability < 60) weaknesses.push('Resume may be too sparse or unbalanced across sections');

  return weaknesses;
}

function generateSuggestions(scores, structureDetails, skillsDetails, impactDetails, content) {
  const suggestions = [];

  if (!content.personal?.summary) {
    suggestions.push({
      priority: 'high',
      category: 'structure',
      text: 'Add a professional summary (3–4 lines) tailored to your target role.',
    });
  }

  if (impactDetails.withMetrics < 3) {
    suggestions.push({
      priority: 'high',
      category: 'impact',
      text: 'Quantify at least 3 experience bullets with numbers, percentages, or scale (e.g., "Reduced load time by 40%").',
    });
  }

  if (skillsDetails.skillCount < 10) {
    suggestions.push({
      priority: 'medium',
      category: 'skills',
      text: `Add more relevant technical skills. You currently have ${skillsDetails.skillCount} — aim for 12–18.`,
    });
  }

  if (!skillsDetails.isCategorized) {
    suggestions.push({
      priority: 'medium',
      category: 'skills',
      text: 'Organize skills into categories: Technical, Tools, Soft Skills. ATS parsers score categorized skills higher.',
    });
  }

  if (scores.keyword < 60) {
    suggestions.push({
      priority: 'medium',
      category: 'keywords',
      text: 'Incorporate more industry keywords naturally into your experience descriptions and skills.',
    });
  }

  if (impactDetails.withActionVerbs < impactDetails.bulletsAnalyzed * 0.6) {
    suggestions.push({
      priority: 'low',
      category: 'impact',
      text: 'Start each bullet point with a strong action verb (Built, Designed, Optimized, Led, Reduced).',
    });
  }

  if (Array.isArray(content.projects) && content.projects.length < 2) {
    suggestions.push({
      priority: 'medium',
      category: 'structure',
      text: 'Add at least 2–3 projects with tech stack and measurable outcomes to strengthen your portfolio.',
    });
  }

  return suggestions;
}

// ── ML feature vector ─────────────────────────────────────────────────────────

function buildFeatureVector(content, scores, skillsDetails, impactDetails, keywordDetails) {
  return {
    skillCount:           skillsDetails.skillCount,
    techSkillCount:       skillsDetails.techSkillCount,
    isCategorized:        skillsDetails.isCategorized ? 1 : 0,
    experienceCount:      content.experience?.length ?? 0,
    projectCount:         content.projects?.length ?? 0,
    bulletCount:          impactDetails.bulletsAnalyzed,
    achievementDensity:   impactDetails.bulletsAnalyzed > 0
                            ? +(impactDetails.withMetrics / impactDetails.bulletsAnalyzed).toFixed(3)
                            : 0,
    actionVerbDensity:    impactDetails.bulletsAnalyzed > 0
                            ? +(impactDetails.withActionVerbs / impactDetails.bulletsAnalyzed).toFixed(3)
                            : 0,
    keywordDensity:       +(keywordDetails.keywordsFound / keywordDetails.totalKeywordsChecked).toFixed(3),
    sectionCompleteness:  +(scores.structure / 100).toFixed(3),
    overallScore:         scores.overall,
  };
}

// ── Job match analysis ────────────────────────────────────────────────────────

// ── REPLACE analyzeJobMatch() ─────────────────────────────────────────────────
// Old version: didn't strip punctuation → "node.js." ≠ "node.js"
// Old version: stop words list was too small → "that", "using", "assist" appeared
// New version: clean tokens before comparison, comprehensive stop words

function analyzeJobMatch(content, jobDescription) {
  const resumeText = flattenResumeToText(content);

  // ── Tokenizer: strip punctuation, lowercase, deduplicate ──────────────────
  const cleanToken = (word) =>
    word.toLowerCase().replace(/[^a-z0-9#+.]/g, '').replace(/\.+$/, '');

  // Comprehensive stop words — common English + resume filler words
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','be','by','from','as','we','you','our','your','this',
    'that','will','have','has','had','not','they','their','all','also',
    'can','its','one','who','what','how','when','where','which','about',
    'into','than','then','them','these','those','been','being','would',
    'could','should','may','might','must','shall','do','did','does',
    'get','got','use','used','using','work','works','worked','working',
    'make','made','help','helped','assist','overview','role','intern',
    'please','via','per','up','out','new','good','well','both','each',
    'more','other','some','such','any','over','own','same','so','too',
    'very','just','now','even','most','after','before','between','under',
    'while','through','during','around','across','along','within',
    // resume-specific noise words
    'responsibilities','responsibility','required','requirements','including',
    'ability','strong','excellent','experience','experiences','years','year',
    'plus','looking','seeking','join','team','company','position','role',
  ]);

  // Minimum meaningful word length
  const MIN_LENGTH = 3;

  const tokenize = (text) =>
    [...new Set(
      text.toLowerCase()
        .split(/[\s,;:()\[\]{}"'\/\\]+/)
        .map(cleanToken)
        .filter((w) => w.length >= MIN_LENGTH && !stopWords.has(w) && !/^\d+$/.test(w))
    )];

  const jdTokens     = tokenize(jobDescription);
  const resumeTokens = new Set(tokenize(resumeText));

  const matchedKeywords = jdTokens.filter((w) => resumeTokens.has(w));
  const missingKeywords = jdTokens.filter((w) => !resumeTokens.has(w));

  // Filter missing to only meaningful ones — tech keywords or length > 4
  const meaningfulMissing = missingKeywords
    .filter((w) => TECH_KEYWORDS.has(w) || w.length > 4)
    .slice(0, 25);

  const matchScore = jdTokens.length > 0
    ? Math.round((matchedKeywords.length / jdTokens.length) * 100)
    : 0;

  const skillGap = meaningfulMissing.filter((w) => TECH_KEYWORDS.has(w));

  const recommendations = [];

  if (skillGap.length > 0) {
    recommendations.push({
      priority: 'high',
      text: `Add these missing technical skills from the JD to your resume: ${skillGap.slice(0, 5).join(', ')}.`,
    });
  }

  if (matchScore < 50) {
    recommendations.push({
      priority: 'high',
      text: 'Your resume covers less than 50% of the job description keywords. Tailor your experience descriptions.',
    });
  }

  if (meaningfulMissing.length > 8) {
    recommendations.push({
      priority: 'medium',
      text: 'Rewrite 2–3 experience or project bullets to naturally include more JD-specific terminology.',
    });
  }

  return {
    matchScore: Math.min(matchScore, 100),
    matchedKeywords: matchedKeywords.slice(0, 30),
    missingKeywords: meaningfulMissing,
    skillGap,
    recommendations,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run a full Resume Health Analysis.
 * @param {Object} content - Parsed resume JSON from DB
 * @returns {Object} Full analysis result ready to store
 */
export function runHealthAnalysis(content) {
  const structureResult    = calcStructureScore(content);
  const skillsResult       = calcSkillsScore(content);
  const impactResult       = calcImpactScore(content);
  const keywordResult      = calcKeywordScore(content);
  const readabilityResult  = calcReadabilityScore(content);

  const scores = {
    structure:   structureResult.score,
    skills:      skillsResult.score,
    impact:      impactResult.score,
    keyword:     keywordResult.score,
    readability: readabilityResult.score,
  };
  scores.overall = calcOverallScore(scores);

  const strengths   = generateStrengths(scores, structureResult, skillsResult, impactResult);
  const weaknesses  = generateWeaknesses(scores, structureResult, skillsResult, impactResult);
  const suggestions = generateSuggestions(scores, structureResult, skillsResult, impactResult, content);
  const featureVector = buildFeatureVector(content, scores, skillsResult, impactResult, keywordResult);

  return {
    analysis_type:     'health',
    overall_score:     scores.overall,
    structure_score:   scores.structure,
    skills_score:      scores.skills,
    impact_score:      scores.impact,
    keyword_score:     scores.keyword,
    readability_score: scores.readability,
    strengths,
    weaknesses,
    suggestions,
    feature_vector:    featureVector,
  };
}

/**
 * Run a Job Match Analysis.
 * @param {Object} content - Parsed resume JSON
 * @param {string} jobDescription - Raw JD text
 * @param {string} jobTitle
 * @param {string} company
 * @returns {Object} Full job match result
 */
export function runJobMatchAnalysis(content, jobDescription, jobTitle = '', company = '') {
  // Also run health analysis so we store full scores
  const health = runHealthAnalysis(content);
  const match  = analyzeJobMatch(content, jobDescription);

  return {
    ...health,
    analysis_type:    'job_match',
    job_description:  jobDescription,
    job_title:        jobTitle,
    company,
    match_score:      match.matchScore,
    matched_keywords: match.matchedKeywords,
    missing_keywords: match.missingKeywords,
    suggestions: [
      ...match.recommendations.map((r) => ({ ...r, category: 'job_match' })),
      ...health.suggestions,
    ],
  };
}