// AI-services/rolePromptBuilder.js
// ─────────────────────────────────────────────────────────────────────────────
// AI prompts for the Role Matching explanation layer.
// Kept in a SEPARATE file so the existing promptBuilder.js stays unchanged.
// Import and use alongside the existing prompt builders.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_SYSTEM_PROMPT = `You are a senior tech career counselor with deep expertise in the Indian tech industry. 
You give honest, actionable, and encouraging career advice. 
You understand the job market for freshers and early-career professionals in India.
Your tone is like a knowledgeable mentor — warm, direct, never preachy.
Output ONLY the structured content requested — no preamble, no markdown headers.`;

/**
 * Build explanation prompt for a single matched role.
 * Called once per top role; use sparingly (e.g., top 3 only).
 *
 * @param {Object} params
 * @param {string} params.role           - Role name e.g. "Full Stack Developer"
 * @param {number} params.score          - Match score 0-100
 * @param {string[]} params.matchedSkills
 * @param {string[]} params.missingSkills
 * @param {string[]} params.growthPath   - Career progression steps
 * @param {string}   params.trajectory   - Detected trajectory e.g. "Full Stack Track"
 * @param {string}   params.candidateName - From resume.personal.fullName (optional)
 * @returns {{ system: string, user: string }}
 */
export function buildRoleExplanationPrompt({
  role,
  score,
  matchedSkills,
  missingSkills,
  growthPath,
  trajectory,
  candidateName,
}) {
  const nameGreeting = candidateName ? `Candidate: ${candidateName}` : '';

  return {
    system: ROLE_SYSTEM_PROMPT,
    user: `${nameGreeting}
Career trajectory detected: ${trajectory}
Role being analyzed: ${role}
Match score: ${score}%

Matched skills: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None detected yet'}
Missing skills: ${missingSkills.length > 0 ? missingSkills.join(', ') : 'None — great fit!'}
Growth path: ${growthPath.join(' → ')}

Write a career explanation in EXACTLY this format (no extra text before or after):

FIT: [1 sentence — why this role is a good match based on their existing skills]
GAP: [1 sentence — the most important skill gap and why it matters for this role]
ROADMAP: [2–3 bullet points starting with "•" — specific, actionable learning steps for the missing skills, ordered by priority. Include free resources like "freeCodeCamp", "The Odin Project", or "official docs" where relevant]
MOTIVATION: [1 short encouraging sentence — specific to their situation, not generic]

Keep the entire response under 120 words. Be specific, not generic.`,
  };
}

/**
 * Build a summary prompt for the overall career analysis.
 * Called once for the entire result set.
 *
 * @param {Object} params
 * @param {string}   params.trajectory
 * @param {string[]} params.topRoles      - Names of top 3 matched roles
 * @param {string[]} params.candidateSkills - All detected skills
 * @param {number}   params.topScore      - Highest match score
 * @returns {{ system: string, user: string }}
 */
export function buildCareerSummaryPrompt({
  trajectory,
  topRoles,
  candidateSkills,
  topScore,
}) {
  return {
    system: ROLE_SYSTEM_PROMPT,
    user: `Detected career trajectory: ${trajectory}
Top matching roles: ${topRoles.join(', ')}
Best match score: ${topScore}%
Skills portfolio: ${candidateSkills.slice(0, 15).join(', ')}

Write a 2-sentence career summary:
Sentence 1: Describe the candidate's overall profile and strongest career direction.
Sentence 2: One high-impact action they should take this week to accelerate their career.

Be specific. No generic advice. Under 60 words total.`,
  };
}
