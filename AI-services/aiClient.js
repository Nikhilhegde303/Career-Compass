// AI-services/aiClient.js
// ─────────────────────────────────────────────────────────────────────────────
// Groq API wrapper.
// Supports temperature variation so Regenerate produces different output.
// ─────────────────────────────────────────────────────────────────────────────

import https from 'https';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';
const TIMEOUT_MS   = 15000;

// Temperature map per variation count:
// variation 0 = first call  → 0.45 (focused but creative)
// variation 1 = regenerate  → 0.65 (more creative, different angle)
// variation 2+ = regenerate → 0.75 (even more varied)
const getTemperature = (baseTemp, variation) => {
  if (variation === 0) return baseTemp;
  if (variation === 1) return Math.min(baseTemp + 0.2, 0.75);
  return Math.min(baseTemp + 0.3, 0.85);
};

/**
 * Call Groq chat completion.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options
 * @param {number} options.temperature  - Base temperature (default 0.45)
 * @param {number} options.maxTokens   - Max output tokens (default 1024)
 * @param {number} options.variation   - Regenerate count: 0=first, 1+=regenerate
 * @returns {Promise<string>}
 */
export async function callGroq(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables.');

  const variation   = options.variation ?? 0;
  const temperature = getTemperature(options.temperature ?? 0.45, variation);
  const maxTokens   = options.maxTokens ?? 1024;

  const body = JSON.stringify({
    model:       MODEL,
    messages,
    max_tokens:  maxTokens,
    temperature,
    stream:      false,
  });

  return new Promise((resolve, reject) => {
    const url     = new URL(GROQ_API_URL);
    const timeout = setTimeout(() => {
      req.destroy();
      reject(new Error('AI request timed out. Please try again.'));
    }, TIMEOUT_MS);

    const req = https.request(
      {
        hostname: url.hostname,
        path:     url.pathname,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json',
          'Authorization':  `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              reject(new Error(parsed.error.message || 'Groq API error'));
              return;
            }
            if (res.statusCode !== 200) {
              reject(new Error(`Groq returned status ${res.statusCode}: ${data}`));
              return;
            }

            const content = parsed.choices?.[0]?.message?.content;
            if (!content) {
              reject(new Error('Empty response from AI. Please try again.'));
              return;
            }

            resolve(content.trim());
          } catch {
            reject(new Error('Failed to parse AI response.'));
          }
        });
      }
    );

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Network error: ${err.message}`));
    });

    req.write(body);
    req.end();
  });
}
