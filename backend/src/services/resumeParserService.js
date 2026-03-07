import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

class ResumeParserService {
  /**
   * Extract text from uploaded file
   */
  async extractText(file) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    console.log(`\n[Parser] ==========================================`);
    console.log(`[Parser] File: ${file.originalname}`);
    console.log(`[Parser] Type: ${ext.toUpperCase()}`);
    console.log(`[Parser] Size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`[Parser] ==========================================\n`);

    try {
      let text = '';

      if (ext === 'pdf') {
        text = await this.extractFromPDF(file.buffer);
      } else if (ext === 'docx' || ext === 'doc') {
        text = await this.extractFromDOCX(file.buffer);
      } else if (ext === 'txt') {
        text = file.buffer.toString('utf-8');
      } else {
        throw new Error(`Unsupported format: .${ext}. Upload PDF or DOCX.`);
      }

      if (!text || text.trim().length < 50) {
        throw new Error('File appears empty or contains insufficient text.');
      }

      console.log(`[Parser] ✅ Extracted ${text.length} characters`);
      console.log(`[Parser] First 200 chars: ${text.substring(0, 200)}...\n`);
      return text;

    } catch (error) {
      console.error(`[Parser] ❌ Error:`, error.message);
      throw error;
    }
  }

  /**
   * Extract text from PDF using PDF.js (preserving structure)
   */
  async extractFromPDF(buffer) {
    console.log('[Parser] Starting PDF.js extraction...');
    
    try {
      const data = new Uint8Array(buffer);
      
      const loadingTask = pdfjsLib.getDocument({
        data: data,
        useSystemFonts: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
      });
      
      const pdf = await loadingTask.promise;
      console.log(`[Parser] PDF loaded: ${pdf.numPages} pages`);
      
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Preserve line breaks by checking Y positions
        let lastY = null;
        let pageText = '';
        
        textContent.items.forEach(item => {
          const currentY = item.transform[5]; // Y position
          
          // New line if Y position changed significantly
          if (lastY !== null && Math.abs(currentY - lastY) > 2) {
            pageText += '\n';
          }
          
          pageText += item.str + ' ';
          lastY = currentY;
        });
        
        fullText += pageText + '\n';
      }

      console.log(`[Parser] Total extracted: ${fullText.length} characters`);
      return fullText;

    } catch (error) {
      console.error('[Parser] PDF.js error:', error.message);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX
   */
  async extractFromDOCX(buffer) {
    console.log('[Parser] Starting DOCX extraction...');
    
    try {
      const result = await mammoth.extractRawText({ buffer });
      console.log(`[Parser] DOCX: ${result.value.length} chars`);
      
      if (!result.value || result.value.length < 50) {
        throw new Error('DOCX appears empty.');
      }

      return result.value;
    } catch (error) {
      console.error('[Parser] DOCX error:', error.message);
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  /**
   * Parse resume text into structured data
   */
  parseResume(text) {
    console.log(`\n[Parser] ========== PARSING STARTED ==========`);
    
    // Clean and normalize
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    const lines = cleaned
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    console.log(`[Parser] Processing ${lines.length} lines\n`);

    // Extract all sections
    const personal = this.extractPersonalInfo(lines, cleaned);
    const sections = this.identifySections(lines);
    const education = this.extractEducation(sections.education || [], cleaned);
    const experience = this.extractExperience(sections.experience || []);
    const skills = this.extractSkills(sections.skills || [], cleaned);
    const projects = this.extractProjects(sections.projects || []);

    const parsedData = { personal, education, experience, skills, projects };

    // Detailed logging
    console.log(`\n[Parser] ========== EXTRACTION RESULTS ==========`);
    console.log(`[Parser] 👤 Name: ${personal.fullName || '❌ NOT FOUND'}`);
    console.log(`[Parser] 📧 Email: ${personal.email || '❌ NOT FOUND'}`);
    console.log(`[Parser] 📞 Phone: ${personal.phone || '❌ NOT FOUND'}`);
    console.log(`[Parser] 🔗 LinkedIn: ${personal.linkedin || '❌ NOT FOUND'}`);
    console.log(`[Parser] 🎓 Education: ${education.length} entries`);
    education.forEach((edu, i) => {
      console.log(`[Parser]    ${i + 1}. ${edu.degree} - ${edu.institution}`);
    });
    console.log(`[Parser] 💼 Experience: ${experience.length} entries`);
    console.log(`[Parser] 💻 Skills: ${skills.technical.length} technical, ${skills.soft.length} soft, ${skills.languages.length} languages`);
    console.log(`[Parser] 🚀 Projects: ${projects.length} entries`);
    projects.forEach((proj, i) => {
      console.log(`[Parser]    ${i + 1}. ${proj.name}`);
    });
    console.log(`[Parser] ============================================\n`);

    const analysis = this.analyzeResume(parsedData);
    return { parsedData, analysis };
  }

  /**
   * Extract personal information (IMPROVED)
   */
  extractPersonalInfo(lines, fullText) {
    console.log(`[Parser] Extracting personal info...`);

    // Patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/i;

    const email = fullText.match(emailRegex);
    const phone = fullText.match(phoneRegex);
    const linkedin = fullText.match(linkedinRegex);
    const github = fullText.match(githubRegex);

    // Extract name from FIRST line (most resumes have name at top)
    let fullName = '';
    
    // Look at first 3 lines only
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip if it contains contact info
      if (emailRegex.test(line) || phoneRegex.test(line)) continue;
      if (line.toLowerCase().includes('resume')) continue;
      if (line.toLowerCase().includes('curriculum')) continue;
      
      // Check if it's likely a name (2-4 words, each capitalized)
      const words = line.split(/\s+/);
      
      if (words.length >= 2 && words.length <= 4 && line.length < 50) {
        // Each word should start with capital letter
        const allCapitalized = words.every(word => 
          word.length > 0 && 
          /^[A-Z]/.test(word) && 
          !/\d/.test(word) &&
          word.length < 20
        );
        
        if (allCapitalized) {
          fullName = line;
          console.log(`[Parser]   ✓ Found name: "${fullName}"`);
          break;
        }
      }
    }

    const personal = {
      fullName,
      email: email ? email[0] : '',
      phone: phone ? phone[0].replace(/\s+/g, ' ').trim() : '',
      location: '',
      linkedin: linkedin ? linkedin[0] : '',
      portfolio: github ? github[0] : '',
      summary: ''
    };

    console.log(`[Parser]   ✓ Email: ${personal.email}`);
    console.log(`[Parser]   ✓ Phone: ${personal.phone}`);
    console.log(`[Parser]   ✓ LinkedIn: ${personal.linkedin}`);
    
    return personal;
  }

  /**
   * Identify sections (IMPROVED - case insensitive, flexible)
   */
  identifySections(lines) {
    console.log(`[Parser] Identifying sections...`);
    
    const sections = {};
    let currentSection = null;
    let sectionContent = [];

    // More flexible patterns
    const sectionPatterns = {
      education: /^(education|academic|qualifications?|university|college)$/i,
      experience: /^(experience|employment|work\s*history|professional\s*experience|career)$/i,
      skills: /^(skills|technical\s*skills|technologies|competencies|expertise)$/i,
      projects: /^(projects?|portfolio|personal\s*projects?)$/i,
      activities: /^(activities|extra.*curricular|achievements?|leadership)$/i,
      certifications: /^(certifications?|certificates?|licenses?)$/i
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      let foundSection = false;

      // Check if line is a section header
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(trimmed)) {
          // Save previous section
          if (currentSection && sectionContent.length > 0) {
            sections[currentSection] = sectionContent;
            console.log(`[Parser]   ✓ ${currentSection}: ${sectionContent.length} lines`);
          }
          
          currentSection = sectionName;
          sectionContent = [];
          foundSection = true;
          console.log(`[Parser]   Found section header: "${trimmed}" -> ${sectionName}`);
          break;
        }
      }

      // Add to current section if not a header
      if (!foundSection && currentSection) {
        sectionContent.push(trimmed);
      }
    });

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      sections[currentSection] = sectionContent;
      console.log(`[Parser]   ✓ ${currentSection}: ${sectionContent.length} lines`);
    }

    console.log(`[Parser] Total sections found: ${Object.keys(sections).length}\n`);
    return sections;
  }

  /**
   * Extract education (IMPROVED - handles multiple formats)
   */
  extractEducation(lines, fullText) {
    console.log(`[Parser] Extracting education from ${lines.length} lines...`);
    
    const education = [];
    
    // Patterns
    const degreePattern = /\b(b\.?tech|m\.?tech|bachelor|master|phd|diploma|b\.?e|m\.?e|b\.?s\.?c?|m\.?s\.?c?|bba|mba|pre[-\s]?university|s\.?s\.?l\.?c|class\s*10|class\s*12)/i;
    const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
    const gpaPattern = /\b(?:result|cgpa|gpa|grade|score|percentage)[\s:]*(\d+\.?\d*)\s*(?:%|cgpa|gpa|\/\s*(\d+\.?\d*))?\b/i;

    let currentEntry = null;
    let buffer = [];

    lines.forEach((line, index) => {
      // Check if this line starts a new education entry
      const hasDegree = degreePattern.test(line);
      const years = line.match(yearPattern);
      const gpaMatch = line.match(gpaPattern);

      if (hasDegree) {
        // Save previous entry
        if (currentEntry) {
          // Combine buffer as additional info
          if (buffer.length > 0) {
            currentEntry.degree += ' ' + buffer.join(' ');
          }
          education.push(currentEntry);
          buffer = [];
        }

        // Parse GPA if present
        let gpa = '';
        if (gpaMatch) {
          gpa = gpaMatch[2] ? `${gpaMatch[1]}/${gpaMatch[2]}` : gpaMatch[1];
          // Add % if it's a percentage
          if (line.includes('%')) gpa += '%';
        }

        // Create new entry
        currentEntry = {
          id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          institution: '',
          degree: line,
          field: '',
          location: '',
          startDate: years && years[0] ? `${years[0]}-01` : '',
          endDate: years && years[1] ? `${years[1]}-12` : years && years[0] ? `${years[0]}-12` : '',
          gpa: gpa,
          achievements: []
        };

        console.log(`[Parser]     New education entry: "${line}"`);
      } else if (currentEntry) {
        // This line provides additional context
        // Check if it's an institution name (usually has "college", "university", "school")
        if (/college|university|school|institute/i.test(line) && !currentEntry.institution) {
          currentEntry.institution = line;
          console.log(`[Parser]       Institution: "${line}"`);
        } else if (line.startsWith('•') || line.startsWith('-')) {
          // It's an achievement/honor
          currentEntry.achievements.push(line.replace(/^[•\-]\s*/, ''));
        } else if (line.toLowerCase().includes('major')) {
          // Extract major/field
          const majorMatch = line.match(/major:\s*([^,|]+)/i);
          if (majorMatch) {
            currentEntry.field = majorMatch[1].trim();
          }
        } else {
          // Add to buffer for potential inclusion
          buffer.push(line);
        }
      }
    });

    // Don't forget the last entry
    if (currentEntry) {
      if (buffer.length > 0 && !currentEntry.institution) {
        // First buffer item might be institution
        currentEntry.institution = buffer[0];
      }
      education.push(currentEntry);
    }

    console.log(`[Parser]   ✓ Extracted ${education.length} education entries\n`);
    return education;
  }

  /**
   * Extract experience (IMPROVED)
   */
  extractExperience(lines) {
    console.log(`[Parser] Extracting experience from ${lines.length} lines...`);
    
    const experience = [];
    const yearPattern = /\b(20\d{2}|19\d{2})\b/g;
    const presentPattern = /\b(present|current|ongoing|now)\b/i;

    let currentEntry = null;

    lines.forEach(line => {
      const years = line.match(yearPattern);
      const isPresent = presentPattern.test(line);

      // New experience entry detected (has dates)
      if (years || isPresent) {
        if (currentEntry) {
          experience.push(currentEntry);
        }

        // Parse position and company
        const parts = line.split(/[-–|@,]/);
        
        currentEntry = {
          id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          company: parts.length > 1 ? parts[1].trim() : '',
          position: parts[0].trim(),
          location: '',
          startDate: years && years[0] ? `${years[0]}-01` : '',
          endDate: isPresent ? '' : years && years[1] ? `${years[1]}-12` : '',
          current: isPresent,
          achievements: []
        };
      } else if (currentEntry) {
        // Add as achievement/responsibility
        if (line.match(/^[•\-*➢]/)) {
          currentEntry.achievements.push(line.replace(/^[•\-*➢]\s*/, ''));
        } else if (!currentEntry.company && line.length > 2) {
          currentEntry.company = line;
        }
      }
    });

    if (currentEntry) {
      experience.push(currentEntry);
    }

    console.log(`[Parser]   ✓ Extracted ${experience.length} experience entries\n`);
    return experience;
  }

  /**
   * Extract skills (IMPROVED - better categorization)
   */
  extractSkills(lines, fullText) {
    console.log(`[Parser] Extracting skills...`);
    
    // Combine lines
    const text = lines.join(' ');
    
    // Split by common delimiters
    const allItems = text
      .split(/[,;•\-\n|]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 100);

    // Comprehensive keywords
    const techKeywords = [
      'java', 'python', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'typescript', 'sql',
      'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
      'mysql', 'mongodb', 'postgresql', 'redis', 'restful', 'api', 'git', 'github',
      'aws', 'azure', 'docker', 'kubernetes', 'linux', 'unix',
      'data structures', 'algorithms', 'oop', 'operating system', 'dbms', 'networks'
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'creative', 'management', 'planning', 'organization'
    ];

    const technical = [];
    const soft = [];
    const languages = [];

    allItems.forEach(item => {
      const lower = item.toLowerCase();
      
      // Skip section headers
      if (lower === 'skills' || lower === 'technical' || lower === 'programming') return;
      
      // Check for technical skills
      if (techKeywords.some(kw => lower.includes(kw))) {
        if (!technical.includes(item)) technical.push(item);
      }
      // Check for soft skills
      else if (softKeywords.some(kw => lower.includes(kw))) {
        if (!soft.includes(item)) soft.push(item);
      }
      // Check for languages (English, Hindi, etc.)
      else if (/\b(english|hindi|kannada|tamil|telugu|spanish|french)\b/i.test(lower)) {
        if (!languages.includes(item)) languages.push(item);
      }
      // Default to technical if looks valid
      else if (item.length > 2 && technical.length < 30) {
        if (!technical.includes(item)) technical.push(item);
      }
    });

    console.log(`[Parser]   ✓ Technical: ${technical.length}`);
    console.log(`[Parser]   ✓ Soft: ${soft.length}`);
    console.log(`[Parser]   ✓ Languages: ${languages.length}\n`);
    
    return { technical, soft, languages };
  }

  /**
   * Extract projects (IMPROVED)
   */
  extractProjects(lines) {
    console.log(`[Parser] Extracting projects from ${lines.length} lines...`);
    
    const projects = [];
    let currentProject = null;
    let buffer = [];

    lines.forEach((line, index) => {
      // Project titles are usually:
      // 1. Start with capital letter or special char (➢, •, -)
      // 2. Are not too long
      // 3. Often contain "-" or "–" separator
      
      const looksLikeTitle = (
        (line.match(/^[A-Z➢•\-]/) || line.includes('–') || line.includes(' - ')) &&
        line.length < 120 &&
        !line.startsWith('•') // Not a bullet point
      );

      if (looksLikeTitle && !line.toLowerCase().includes('developed') && !line.toLowerCase().includes('implemented')) {
        // Save previous project
        if (currentProject) {
          // Combine buffer as description
          if (buffer.length > 0) {
            currentProject.description = buffer.join(' ');
          }
          projects.push(currentProject);
          buffer = [];
        }

        // Clean title
        let title = line.replace(/^[➢•\-]\s*/, '').trim();
        
        currentProject = {
          id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: title,
          description: '',
          technologies: [],
          link: '',
          startDate: '',
          endDate: ''
        };

        console.log(`[Parser]     New project: "${title}"`);
      } else if (currentProject) {
        // Add to description buffer
        const cleaned = line.replace(/^[•\-]\s*/, '');
        buffer.push(cleaned);
      }
    });

    // Save last project
    if (currentProject) {
      if (buffer.length > 0) {
        currentProject.description = buffer.join(' ');
      }
      projects.push(currentProject);
    }

    console.log(`[Parser]   ✓ Extracted ${projects.length} projects\n`);
    return projects;
  }

  /**
   * Analyze resume
   */
  analyzeResume(parsedData) {
    const detected = [];
    const missing = [];

    if (parsedData.personal.fullName || parsedData.personal.email) detected.push('Contact Information');
    parsedData.personal.summary ? detected.push('Summary') : missing.push('Summary');
    parsedData.education.length > 0 ? detected.push('Education') : missing.push('Education');
    parsedData.experience.length > 0 ? detected.push('Experience') : missing.push('Experience');
    
    const totalSkills = parsedData.skills.technical.length + parsedData.skills.soft.length + parsedData.skills.languages.length;
    totalSkills > 0 ? detected.push('Skills') : missing.push('Skills');
    
    if (parsedData.projects.length > 0) detected.push('Projects');

    return {
      detectedSections: detected,
      missingSections: missing,
      stats: {
        skillsCount: totalSkills,
        hasEducation: parsedData.education.length > 0,
        hasExperience: parsedData.experience.length > 0,
        hasSummary: !!parsedData.personal.summary,
        hasProjects: parsedData.projects.length > 0,
        educationCount: parsedData.education.length,
        experienceCount: parsedData.experience.length,
        projectsCount: parsedData.projects.length
      },
      firstName: parsedData.personal.fullName.split(' ')[0] || 'there',
      degree: parsedData.education[0]?.degree || null,
      institution: parsedData.education[0]?.institution || null,
      gpa: parsedData.education[0]?.gpa || null,
      topSkills: parsedData.skills.technical.slice(0, 5)
    };
  }
}

export default new ResumeParserService();