// backend/src/services/jobService.js
// ─────────────────────────────────────────────────────────────────────────────
// Pluggable job listings interface.
//
// CURRENT MODE: Static dataset (no API key needed)
// FUTURE MODE:  Uncomment the JSearch section below and set RAPIDAPI_KEY in .env
//
// The function signature and return shape are IDENTICAL in both modes.
// Your controller code doesn't change when you plug in the real API.
// ─────────────────────────────────────────────────────────────────────────────

import { jobListings, genericJobs } from '../utils/jobsDataset.js';

// ── Static mode (active) ──────────────────────────────────────────────────────

/**
 * Fetch job listings for a given role ID.
 *
 * @param {string} roleId   - e.g., 'frontend-dev'
 * @param {string} roleName - e.g., 'Frontend Developer' (for logging)
 * @param {Object} options
 * @param {number} options.limit    - Max jobs to return (default 4)
 * @param {string} options.location - Location filter (future API use, ignored in static)
 * @returns {Promise<Array>} jobs array
 */
export async function getJobsForRole(roleId, roleName, options = {}) {
  const { limit = 4 } = options;

  // Static mode: lookup from dataset
  const jobs = jobListings[roleId] || genericJobs;

  return jobs.slice(0, limit).map(job => ({
    id:          job.id,
    title:       job.title,
    company:     job.company,
    logo:        job.logo,
    location:    job.location,
    type:        job.type,       // 'Internship' | 'Full-time' | 'Contract'
    mode:        job.mode,       // 'Remote' | 'Hybrid' | 'On-site'
    experience:  job.experience,
    salary:      job.salary,
    skills:      job.skills,
    applyLink:   job.applyLink,
    posted:      job.posted,
    description: job.description,
  }));
}

// ── JSearch API mode (plug in when ready) ─────────────────────────────────────
// To activate:
//   1. Get key from https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
//   2. Add RAPIDAPI_KEY=your_key to .env
//   3. Comment out the static mode above and uncomment this section

/*
import https from 'https';

export async function getJobsForRole(roleId, roleName, options = {}) {
  const { limit = 4, location = 'India' } = options;

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn('[jobService] RAPIDAPI_KEY not set — falling back to static data');
    const jobs = jobListings[roleId] || genericJobs;
    return jobs.slice(0, limit);
  }

  const query = encodeURIComponent(`${roleName} ${location}`);
  const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1&page=1`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const jobs = (parsed.data || []).slice(0, limit).map(job => ({
            id:          job.job_id,
            title:       job.job_title,
            company:     job.employer_name,
            logo:        job.employer_logo || '🏢',
            location:    `${job.job_city || ''}, ${job.job_country || 'India'}`.trim(),
            type:        job.job_employment_type || 'Full-time',
            mode:        job.job_is_remote ? 'Remote' : 'On-site',
            experience:  job.job_required_experience?.required_experience_in_months
                          ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)} years`
                          : 'Not specified',
            salary:      job.job_salary_currency
                          ? `${job.job_salary_currency}${job.job_min_salary}–${job.job_max_salary}`
                          : 'Not disclosed',
            skills:      job.job_required_skills || [],
            applyLink:   job.job_apply_link,
            posted:      new Date(job.job_posted_at_datetime_utc).toLocaleDateString(),
            description: job.job_description?.slice(0, 200) + '...',
          }));
          resolve(jobs);
        } catch (err) {
          console.error('[jobService] JSearch parse error:', err.message);
          // Graceful fallback to static
          resolve((jobListings[roleId] || genericJobs).slice(0, limit));
        }
      });
    }).on('error', (err) => {
      console.error('[jobService] JSearch network error:', err.message);
      resolve((jobListings[roleId] || genericJobs).slice(0, limit));
    });
  });
}
*/
