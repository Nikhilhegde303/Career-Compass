// AI-services/promptBuilder.js
// ─────────────────────────────────────────────────────────────────────────────
// Builds structured, targeted prompts for each resume section.
// Each function accepts a `variation` parameter (0, 1, 2...) so Regenerate
// produces genuinely different output by shifting the rewriting angle.
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume writer and ATS optimization specialist with 15 years of experience helping candidates land interviews at top companies. You deeply understand how ATS systems parse resumes and what recruiters look for.

Your absolute rules:
- NEVER invent experience, companies, degrees, certifications, or dates not in the input
- NEVER add metrics or achievements that were not hinted at in the original
- ONLY improve language, structure, clarity, and keyword integration
- Write in a confident, professional, active tone
- Output ONLY the improved content — no explanations, no preamble, no "Here is:", no markdown`;

// ── Variation angle descriptors ───────────────────────────────────────────────
// Each regenerate call shifts the rewriting angle so output is meaningfully
// different — not just a paraphrase of the same structure.

const SUMMARY_ANGLES = [
  'Focus on technical depth and specific technologies. Lead with the most impressive technical capability.',
  'Focus on impact and outcomes. Lead with what value the candidate brings to an organization.',
  'Focus on career trajectory and growth. Lead with ambition, adaptability, and breadth of skills.',
];

const BULLET_ANGLES = [
  'Emphasize the technical challenge and solution. Use precise technical language.',
  'Emphasize the business or user impact. Quantify where the original hints at scale.',
  'Emphasize the process and methodology. Show engineering maturity and best practices.',
];

const PROJECT_ANGLES = [
  'Lead with the technical architecture and stack. Show engineering depth.',
  'Lead with the problem it solves and who it helps. Show product thinking.',
  'Lead with what makes it impressive technically. Show ambition and execution.',
];

// ── Summary ───────────────────────────────────────────────────────────────────

export function buildSummaryPrompt({
  currentSummary, missingKeywords, jobRole, jobDescription, mode, variation = 0,
}) {
  const angle        = SUMMARY_ANGLES[variation % SUMMARY_ANGLES.length];
  const keywordLine  = missingKeywords?.length > 0
    ? `ATS keywords to integrate naturally (do NOT list them — weave them in): ${missingKeywords.slice(0, 8).join(', ')}`
    : 'No specific missing keywords — focus on clarity, confidence, and technical credibility.';
  const roleContext  = mode === 'job_match' && jobRole
    ? `Target role: ${jobRole}`
    : 'Optimize for general software engineering / tech roles.';
  const jdContext    = mode === 'job_match' && jobDescription
    ? `\nJob description excerpt (first 500 chars):\n"${jobDescription.slice(0, 500)}"`
    : '';

  return {
    system: SYSTEM_PROMPT,
    user: `Rewrite this professional summary for maximum ATS impact and recruiter appeal.

${roleContext}${jdContext}

Rewriting angle: ${angle}

${keywordLine}

Current summary:
"${currentSummary}"

Hard requirements:
- Exactly 3–4 sentences
- First sentence must be a strong identity statement (who they are professionally)
- Use active voice throughout
- Integrate keywords naturally — not as a keyword dump
- Must sound human and confident, not generic
- Do NOT copy the original sentence structure — rewrite from scratch

Output ONLY the new summary. Nothing else.`,
  };
}

// ── Experience bullet ─────────────────────────────────────────────────────────

export function buildExperienceBulletPrompt({
  bullet, company, role, missingKeywords, jobDescription, mode, variation = 0,
}) {
  const angle       = BULLET_ANGLES[variation % BULLET_ANGLES.length];
  const keywordLine = missingKeywords?.length > 0
    ? `Relevant keywords to integrate if they fit this bullet naturally: ${missingKeywords.slice(0, 5).join(', ')}`
    : '';
  const context     = [role, company].filter(Boolean).join(' at ');

  return {
    system: SYSTEM_PROMPT,
    user: `Rewrite this experience bullet point to be stronger and more ATS-optimized.

Context: ${context || 'Software/tech role'}
Rewriting angle: ${angle}
${keywordLine}

Original bullet:
"${bullet}"

Hard requirements:
- Start with a STRONG action verb (NOT "Worked", "Helped", "Assisted", "Responsible for")
  Good verbs: Engineered, Architected, Developed, Optimized, Reduced, Increased, Led, Delivered, Built, Implemented, Automated, Migrated, Streamlined, Designed, Launched
- Maximum 2 lines — concise and punchy
- Add a quantified result ONLY if the original hints at scale, speed, or improvement
  Example: "improved speed" → "reduced API response time by ~35%"
- Do NOT invent technologies, tools, or claims not in the original
- Do NOT start with "I"
- Must be clearly better than the original — not just a synonym swap

Output ONLY the improved bullet. Nothing else.`,
  };
}

// ── Skills ────────────────────────────────────────────────────────────────────

export function buildSkillsPrompt({
  currentSkills, missingKeywords, jobDescription, mode, variation = 0,
}) {
  const existing = Object.entries(currentSkills)
    .map(([cat, arr]) => `${cat}: ${Array.isArray(arr) ? arr.join(', ') : arr}`)
    .join('\n');

  const relevantMissing = (missingKeywords || [])
    .filter((kw) => !JSON.stringify(currentSkills).toLowerCase().includes(kw.toLowerCase()))
    .slice(0, 12);

  const addInstruction = variation === 0
    ? 'Add missing technical skills that are directly related to the existing skill set.'
    : variation === 1
    ? 'Focus on organizing and categorizing existing skills more effectively. Add only the most critical missing ones.'
    : 'Prioritize industry-standard tools and frameworks that complement the existing skills.';

  return {
    system: SYSTEM_PROMPT,
    user: `Optimize this skills section for ATS compatibility.

Current skills:
${existing}

${relevantMissing.length > 0 ? `Skills from job description not currently listed: ${relevantMissing.join(', ')}` : ''}

Instructions: ${addInstruction}

Hard requirements:
- Return ONLY a valid JSON object with this exact structure:
  {"technical": [], "soft": [], "languages": []}
- technical: programming languages, frameworks, databases, tools, platforms
- soft: interpersonal and professional skills
- languages: spoken/written languages
- Add missing skills ONLY if they are genuinely related to the existing skill domain
- Do NOT add skills from a completely unrelated domain
- Remove duplicates and redundant entries
- Each skill should be properly capitalized (e.g., "JavaScript" not "javascript")
- No explanations, no markdown code fences — raw JSON only

Output ONLY the JSON object.`,
  };
}

// ── Project description ───────────────────────────────────────────────────────

export function buildProjectPrompt({
  projectName, description, technologies, missingKeywords, mode, variation = 0,
}) {
  const angle       = PROJECT_ANGLES[variation % PROJECT_ANGLES.length];
  const techList    = Array.isArray(technologies)
    ? technologies.join(', ')
    : (technologies || 'Not specified');
  const keywordLine = missingKeywords?.length > 0
    ? `Relevant keywords to integrate if applicable: ${missingKeywords.slice(0, 5).join(', ')}`
    : '';

  return {
    system: SYSTEM_PROMPT,
    user: `Rewrite this project description to be more impressive and ATS-optimized.

Project name: ${projectName}
Technologies used: ${techList}
Rewriting angle: ${angle}
${keywordLine}

Current description:
"${description}"

Hard requirements:
- 2–3 sentences maximum
- First sentence: what the project does / the problem it solves
- Second sentence: how it was built (mention key technologies naturally)
- Third sentence (optional): a result, outcome, or impressive technical detail
- Add metrics ONLY if hinted at in the original
- Do NOT invent features, users, or scale not mentioned
- Must be noticeably stronger than the original

Output ONLY the improved description. Nothing else.`,
  };
}
