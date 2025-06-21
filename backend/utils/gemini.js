const axios = require('axios');
require('dotenv').config();

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function summarizeJobDescription(text) {
  const prompt = `You are an AI assistant tasked with analyzing a job description. Extract the following information and return it as a valid JSON object with these exact keys: 'title', 'summary', 'skills', 'responsibilities', 'requirements', 'keywords', 'education', 'experience', 'projects', 'field_of_study', 'industry'. 'responsibilities', 'requirements', 'keywords', and 'projects' must be lists of strings. 'education' should be an object with 'institution' (string), 'degree' (string), and 'gpa' (string or number) if available, or empty strings if not applicable. 'experience' must be an integer (years of experience, default to 0 if unclear). The 'summary' must be a concise description of the job role. 'keywords' should include all relevant terms from the JD, including skills, technologies, tools, and other important phrases, without duplication. 'skills' must be a list of objects, where each object has two keys: 'skill' (a string representing the skill name) and 'variants' (an array of strings including the skill name and its abbreviations or synonyms, e.g., {'skill': 'JavaScript', 'variants': ['JS', 'JavaScript', 'ECMAScript']}). If a field cannot be determined, use appropriate defaults (e.g., 'Unknown Title' for title, empty list [] for lists, '' for strings, 0 for experience). Do not include additional text or Markdown outside the JSON object.\n\nJob Description:\n${text}`;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const generatedText = response.data.candidates[0].content.parts[0].text;
    const cleanedText = generatedText.replace(/```json\n|\n```/g, '').trim();
    const data = JSON.parse(cleanedText);

    // Transform skills to ensure the correct structure
    const normalizedSkills = Array.isArray(data.skills)
      ? data.skills.map(skill => {
          if (typeof skill === 'string') {
            return { skill: skill, variants: [skill] }; // Fallback for string input
          } else if (typeof skill === 'object' && skill !== null && 'skill' in skill) {
            return {
              skill: skill.skill || '',
              variants: Array.isArray(skill.variants) ? skill.variants : [skill.skill || ''],
            };
          }
          return { skill: '', variants: [] }; // Default for unexpected format
        })
      : [];

    const jdData = {
      title: data.title || 'Unknown Title',
      summary: data.summary || '',
      skills: normalizedSkills,
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      education: typeof data.education === 'object' && data.education !== null ? {
        institution: data.education.institution || '',
        degree: data.education.degree || '',
        gpa: data.education.gpa || '',
      } : { institution: '', degree: '', gpa: '' },
      experience: Number.isInteger(data.experience) ? data.experience : 0,
      projects: Array.isArray(data.projects) ? data.projects : [],
      field_of_study: data.field_of_study || '',
      industry: data.industry || '',
      originalText: text,
    };

    return jdData;
  } catch (error) {
    console.error('Error summarizing job description:', error.message);
    throw new Error('Failed to summarize job description');
  }
}

async function parseCV(text) {
  const prompt = `You are an AI assistant tasked with analyzing a CV. Extract the following information and return it as a valid JSON object with these exact keys: 'name', 'email', 'phone', 'skills', 'education', 'experience', 'work_experience', 'certifications', 'projects', 'field_of_study', 'industry', 'experience_details'. 'experience_details' should be a list of objects with 'company', 'role', and 'duration' keys (e.g., {'company': 'Upwork', 'role': 'Freelancer', 'duration': 'July 2024 – Present'}), or an empty list if not available. 'education' should be an object with 'institution', 'degree', and 'gpa' if available, or empty strings if not. 'experience' should be the total years of experience as a decimal, calculated from 'experience_details' durations (e.g., 'July 2024 – Present' to ~0.9 years as of June 19, 2025, 'Jan 2025 – Ongoing' to ~0.5 years), defaulting to 0 if unclear. 'work_experience' should be a list of strings summarizing each role (e.g., ['Upwork - Freelancer (July 2024 – Present)']), not objects. 'projects' should be a list of formatted strings, not objects. Each string should summarize the project name, description, and GitHub URL if available (e.g., 'Project Name - Description (GitHub: https://...)'). 'skills' should include all technologies and tools mentioned. If a field cannot be determined, use defaults (e.g., 'Unknown' for name, [] for lists, '' for strings, 0 for experience). Do not include additional text or Markdown outside the JSON object. CV Text:${text}`;


  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const generatedText = response.data.candidates[0].content.parts[0].text;
    const cleanedText = generatedText.replace(/```json\n|\n```/g, '').trim();
    const data = JSON.parse(cleanedText);

    let experience = data.experience || 0;
    const now = new Date('2025-06-19');
    if (!experience && Array.isArray(data.experience_details) && data.experience_details.length > 0) {
      experience = data.experience_details.reduce((total, exp) => {
        if (exp.duration) {
          const [startStr, endStr] = exp.duration.split('–').map(s => s.trim());
          let start = new Date(startStr);
          if (isNaN(start.getTime())) {
            // Handle partial dates (e.g., "July 2024")
            const [month, year] = startStr.split(' ');
            start = new Date(`${month} 1, ${year}`);
          }
          let end = endStr === 'Present' || endStr === 'Ongoing' ? now : new Date(endStr);
          if (isNaN(end.getTime())) {
            const [month, year] = endStr.split(' ');
            end = new Date(`${month} 1, ${year}`);
          }
          const diffTime = end - start;
          const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // Accurate year conversion
          return total + (diffYears > 0 ? diffYears : 0);
        }
        return total;
      }, 0);
      experience = Math.max(0, Math.round(experience * 10) / 10); // Ensure non-negative, round to 1 decimal
    }

    const cvData = {
      name: data.name || 'Unknown',
      email: data.email || '',
      phone: data.phone || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      education: typeof data.education === 'object' && data.education !== null ? {
        institution: data.education.institution || '',
        degree: data.education.degree || '',
        gpa: data.education.gpa || '',
      } : { institution: '', degree: '', gpa: '' },
      experience,
      work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      field_of_study: data.field_of_study || '',
      industry: data.industry || '',
      experience_details: Array.isArray(data.experience_details) ? data.experience_details : [],
    };

    return cvData;
  } catch (error) {
    console.error('Error parsing CV:', error.message);
    throw new Error('Failed to parse CV');
  }
}

module.exports = { summarizeJobDescription, parseCV };