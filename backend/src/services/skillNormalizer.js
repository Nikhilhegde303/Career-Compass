// backend/src/services/skillNormalizer.js
// ─────────────────────────────────────────────────────────────────────────────
// Normalizes skill strings so "ReactJS" === "React" === "react.js" in matching.
// This prevents false negatives that unfairly hurt match scores.
// Also extracts skill tokens from free-form text (project descriptions, etc.)
// ─────────────────────────────────────────────────────────────────────────────

// Synonym map: any alias → canonical form
// All keys and values are lowercase
const SYNONYM_MAP = {
  // JavaScript ecosystem
  'js':             'javascript',
  'es6':            'javascript',
  'es2015':         'javascript',
  'vanillajs':      'javascript',
  'typescript':     'typescript',
  'ts':             'typescript',
  'node':           'nodejs',
  'node.js':        'nodejs',
  'nodejs':         'nodejs',
  'express.js':     'express',
  'expressjs':      'express',
  'react.js':       'react',
  'reactjs':        'react',
  'react native':   'react native',
  'rn':             'react native',
  'redux.js':       'redux',
  'next.js':        'nextjs',
  'nextjs':         'nextjs',
  'vue.js':         'vue',
  'vuejs':          'vue',
  'angular.js':     'angular',
  'angularjs':      'angular',

  // Databases
  'mysql':          'mysql',
  'postgresql':     'postgresql',
  'postgres':       'postgresql',
  'psql':           'postgresql',
  'mongodb':        'mongodb',
  'mongo':          'mongodb',
  'sqlite':         'sqlite',
  'redis':          'redis',
  'dynamodb':       'dynamodb',
  'firebase':       'firebase',

  // Python ecosystem
  'python3':        'python',
  'py':             'python',
  'django':         'django',
  'flask':          'flask',
  'fastapi':        'fastapi',
  'pandas':         'pandas',
  'numpy':          'numpy',
  'scikit':         'scikit-learn',
  'sklearn':        'scikit-learn',
  'scikit-learn':   'scikit-learn',
  'tensorflow':     'tensorflow',
  'tf':             'tensorflow',
  'pytorch':        'pytorch',
  'torch':          'pytorch',

  // Java ecosystem
  'java':           'java',
  'springboot':     'spring boot',
  'spring-boot':    'spring boot',
  'spring':         'spring boot',
  'maven':          'maven',
  'gradle':         'gradle',

  // APIs
  'rest':           'rest api',
  'restful':        'rest api',
  'restful api':    'rest api',
  'rest apis':      'rest api',
  'api':            'rest api',
  'graphql':        'graphql',
  'grpc':           'grpc',
  'websocket':      'websockets',
  'websockets':     'websockets',

  // Auth
  'jwt':            'jwt',
  'json web token': 'jwt',
  'oauth':          'oauth',
  'oauth2':         'oauth',
  'bcrypt':         'authentication',
  'authentication': 'authentication',
  'auth':           'authentication',

  // Cloud / DevOps
  'aws':            'aws',
  'amazon web services': 'aws',
  'gcp':            'gcp',
  'google cloud':   'gcp',
  'azure':          'azure',
  'microsoft azure': 'azure',
  'docker':         'docker',
  'kubernetes':     'kubernetes',
  'k8s':            'kubernetes',
  'ci/cd':          'ci/cd',
  'cicd':           'ci/cd',
  'github actions': 'ci/cd',
  'jenkins':        'jenkins',
  'terraform':      'terraform',
  'nginx':          'nginx',

  // Tools
  'git':            'git',
  'github':         'git',
  'gitlab':         'git',
  'vscode':         'vscode',
  'postman':        'postman',
  'prisma':         'prisma',
  'sequelize':      'sequelize',
  'mongoose':       'mongodb',
  'figma':          'figma',
  'jira':           'jira',

  // CS fundamentals
  'dsa':            'data structures',
  'data structure': 'data structures',
  'algo':           'algorithms',
  'algorithm':      'algorithms',
  'oop':            'oop',
  'object oriented': 'oop',
  'system design':  'system design',

  // Styling
  'tailwind':       'tailwind',
  'tailwindcss':    'tailwind',
  'sass':           'sass',
  'scss':           'sass',
  'bootstrap':      'bootstrap',
  'styled-components': 'styled components',

  // Misc
  'linux':          'linux',
  'unix':           'linux',
  'bash':           'bash',
  'shell':          'bash',
  'agile':          'agile',
  'scrum':          'agile',
  'testing':        'testing',
  'jest':           'jest',
  'mocha':          'testing',
  'debugging':      'debugging',
  'integration':    'rest api',
};

// Known technical skill keywords to mine from free-form text
// Ordered roughly by specificity to avoid false positives
export const KNOWN_TECH_KEYWORDS = [
  'react', 'reactjs', 'react native', 'nextjs', 'angular', 'vue',
  'javascript', 'typescript', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'nodejs', 'node', 'express', 'python', 'java', 'php', 'ruby', 'golang', 'go',
  'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'firebase', 'sqlite',
  'rest', 'restful', 'api', 'graphql', 'grpc', 'websockets',
  'jwt', 'oauth', 'authentication', 'bcrypt',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'linux', 'nginx',
  'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
  'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit', 'sklearn',
  'prisma', 'sequelize', 'mongoose',
  'figma', 'postman', 'vscode',
  'data structures', 'algorithms', 'dsa', 'oop', 'system design',
  'machine learning', 'deep learning', 'nlp', 'computer vision',
  'flutter', 'dart', 'android', 'ios',
  'vite', 'webpack', 'redux',
  'testing', 'jest', 'debugging',
  'agile', 'scrum',
];

/**
 * Normalize a single skill/token to its canonical lowercase form.
 * @param {string} skill
 * @returns {string}
 */
export function normalizeSkill(skill) {
  if (!skill) return '';
  const lower = skill.trim().toLowerCase();
  return SYNONYM_MAP[lower] || lower;
}

/**
 * Extract and normalize skills from a free-form text string.
 * Mines known tech keywords from descriptions, achievements, etc.
 * @param {string} text
 * @returns {string[]} - array of normalized canonical skill names
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();

  // Check multi-word keywords first (longer → higher priority)
  const sortedKeywords = [...KNOWN_TECH_KEYWORDS].sort((a, b) => b.length - a.length);

  for (const kw of sortedKeywords) {
    // Word-boundary check to avoid partial matches
    const regex = new RegExp(`(?<![a-z])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'i');
    if (regex.test(lower)) {
      found.add(normalizeSkill(kw));
    }
  }

  return [...found];
}

/**
 * Normalize a full skills array.
 * @param {string[]} skills
 * @returns {string[]}
 */
export function normalizeSkillArray(skills) {
  return [...new Set((skills || []).map(normalizeSkill).filter(Boolean))];
}
