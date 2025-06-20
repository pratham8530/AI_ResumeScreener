const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { summarizeJobDescription, parseCV } = require('../utils/gemini');
const { calculateMatchScore } = require('../utils/scoring');
const { extractText } = require('../middleware/fileHandler');
const JobDescription = require('../models/JobDescription');
const CV = require('../models/CV');

const supportedTypes = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

router.post('/process-jd', upload.single('file'), async (req, res) => {
  if (!req.file || !supportedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ detail: 'Unsupported file format' });
  }

  try {
    const text = await extractText(req.file);
    if (!text) throw new Error('File content is empty');

    const jdData = await summarizeJobDescription(text);
    const jd = new JobDescription(jdData);
    await jd.save();

    res.json({ jd_data: jdData, jd_id: jd._id });
  } catch (error) {
    console.error('Error processing JD:', error.message);
    res.status(500).json({ detail: `Internal server error: ${error.message}` });
  }
});

const validateCVData = (cvData) => {
  const normalizedData = { ...cvData };
  if (normalizedData.work_experience) {
    normalizedData.work_experience = Array.isArray(normalizedData.work_experience)
      ? normalizedData.work_experience.map(exp => {
          if (typeof exp === 'string') {
            const [company, role] = exp.split('|').map(s => s.trim());
            return { company: company || '', role: role || '', duration: '' };
          }
          return {
            company: exp.company || '',
            role: exp.role || '',
            duration: exp.duration || '',
          };
        })
      : [];
  }
  return normalizedData;
};

router.post('/process-cvs/:jdId', upload.array('files'), async (req, res) => {
  const { jdId } = req.params;
  const files = req.files;

  try {
    const jd = await JobDescription.findById(jdId);
    if (!jd) return res.status(404).json({ detail: 'JD not found' });

    const processedCVs = [];
    for (const file of files) {
      if (!supportedTypes.includes(file.mimetype)) {
        console.warn(`Skipping unsupported file: ${file.originalname}`);
        continue;
      }

      const text = await extractText(file);
      if (!text) {
        console.warn(`Empty content in file: ${file.originalname}`);
        continue;
      }

      let cvData = await parseCV(text);
      if (Array.isArray(cvData.work_experience) && cvData.work_experience.length > 0 && typeof cvData.work_experience[0] === 'object') {
        cvData.work_experience = cvData.work_experience.map(exp => exp.company ? `${exp.company} (${exp.duration || ''})` : '').filter(w => w);
      }
      const scores = calculateMatchScore(jd, cvData);
      const matchScore = scores.overall_match / 100;
      console.log('Calculated Scores:', scores);
      const matchBreakdown = {
        skills: scores.skills_match,
        experience: scores.experience_relevance,
        education: scores.education_match,
        industryRelevance: scores.industry_relevance,
        projects: scores.projects_similarity,
        certifications: scores.certifications_match,
        keywordMatch: scores.keyword_match,
      };

      const cv = new CV({
        ...cvData,
        jd_id: jdId,
        match_score: matchScore,
        match_breakdown: matchBreakdown,
        quick_analysis: scores.quick_analysis, // Include quick_analysis
      });
      await cv.save();
      console.log('Saved CV:', cv); // Debug saved CV

      processedCVs.push({
        id: cv._id,
        name: cvData.name,
        email: cvData.email,
        phone: cvData.phone,
        skills: cvData.skills,
        education: cvData.education,
        experience: cvData.experience,
        work_experience: cvData.work_experience,
        experienceDetails: cvData.experience_details,
        certifications: cvData.certifications,
        projects: cvData.projects,
        matchScore: matchScore,
        matchBreakdown,
        quick_analysis: scores.quick_analysis, // Include in response
      });
    }

    res.json({ processed_cvs: processedCVs, success: true });
  } catch (error) {
    console.error('Error processing CVs:', error.message);
    res.status(500).json({ detail: `Internal server error: ${error.message}` });
  }
});

module.exports = router;