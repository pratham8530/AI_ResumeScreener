const natural = require('natural');

function calculateMatchScore(jdData, cvData) {
  const config = {
    weights: {
      skills: 0.40,
      education: 0.10,
      experience: 0.30,
      industry: 0.10,
      projects: 0.05,
      certifications: 0.05,
    },
  };

  const weights = config.weights;

  const safeJdData = {
    skills: jdData.skills || [],
    education: jdData.education || { degree: '' },
    experience: jdData.experience || 0,
    responsibilities: jdData.responsibilities || [],
    industry: jdData.industry || '',
    projects: jdData.projects || [],
    certifications: jdData.certifications || [],
    keywords: jdData.keywords || [],
  };
  const safeCvData = {
    skills: cvData.skills || [],
    education: cvData.education || { degree: '' },
    experience: cvData.experience || 0,
    work_experience: cvData.work_experience || [],
    industry: cvData.industry || '',
    projects: cvData.projects || [],
    certifications: cvData.certifications || [],
    experience_details: cvData.experience_details || [],
  };

  const jdSkillsFlat = safeJdData.skills.flatMap(skill => skill.variants || [skill.skill || '']).filter(v => typeof v === 'string').map(v => v.toLowerCase());
  const cvSkillsFlat = safeCvData.skills.filter(s => typeof s === 'string').map(s => s.toLowerCase());
  const skillsScore = jdSkillsFlat.length ? jdSkillsFlat.reduce((acc, skill) => acc + (cvSkillsFlat.some(cvSkill => natural.JaroWinklerDistance(skill, cvSkill) > 0.7) ? 1 : 0), 0) / jdSkillsFlat.length : 0;

  const eduLevels = { 'high school': 1, 'associate': 1.5, 'bachelor': 2, 'master': 3, 'phd': 4, 'bachelor’s': 2, 'technology': 2, 'engineering': 2 };
  const jdEdu = (safeJdData.education?.degree || '').toLowerCase();
  const cvEdu = (safeCvData.education?.degree || '').toLowerCase();
  const jdLevel = Object.keys(eduLevels).some(level => jdEdu.includes(level)) ? Object.keys(eduLevels).reduce((acc, level) => jdEdu.includes(level) ? eduLevels[level] : acc, 0) : 0;
  const cvLevel = Object.keys(eduLevels).some(level => cvEdu.includes(level)) ? Object.keys(eduLevels).reduce((acc, level) => cvEdu.includes(level) ? eduLevels[level] : acc, 0) : 0;
  let educationScore = jdLevel === 0 ? 0 : Math.min(cvLevel / jdLevel, 1.0);

  const cvExpYears = safeCvData.experience || 0;
  const jdExpYears = safeJdData.experience || 0;
  let expYearsScore = jdExpYears > 0 ? Math.min(cvExpYears / jdExpYears, 1.5) : (cvExpYears > 0 ? 1.0 : 0);
  const jdResp = safeJdData.responsibilities.join(' ') || '';
  const cvExp = safeCvData.work_experience.join(' ') || '';
  const respScore = jdResp && cvExp ? natural.JaroWinklerDistance(jdResp.toLowerCase(), cvExp.toLowerCase()) : 0.0;
  let experienceScore = 0.7 * expYearsScore + 0.3 * respScore;
  experienceScore = isNaN(experienceScore) ? 0 : Math.min(experienceScore + (expYearsScore >= 0.5 ? 0.1 : 0), 1.2);

  const jdKeywords = safeJdData.keywords.filter(k => typeof k === 'string').map(k => k.toLowerCase());
  const cvKeywords = [...safeCvData.skills, ...safeCvData.work_experience].filter(k => typeof k === 'string').map(k => k.toLowerCase());
  const keywordMatch = jdKeywords.length ? jdKeywords.reduce((acc, keyword) => acc + (cvKeywords.some(cvKw => natural.JaroWinklerDistance(keyword, cvKw) > 0.7) ? 1 : 0), 0) / jdKeywords.length : 1.0;
  const industryScore = safeJdData.industry && safeCvData.industry ? natural.JaroWinklerDistance(safeJdData.industry.toLowerCase(), safeCvData.industry.toLowerCase()) : 0.5;

  const jdProj = safeJdData.projects.join(' ') || '';
  const cvProj = safeCvData.projects.join(' ') || '';
  const projScore = jdProj && cvProj ? natural.JaroWinklerDistance(jdProj.toLowerCase(), cvProj.toLowerCase()) : 0.5;

  const jdCerts = safeJdData.certifications.join(' ') || '';
  const cvCerts = safeCvData.certifications.join(' ') || '';
  const certScore = jdCerts && cvCerts ? natural.JaroWinklerDistance(jdCerts.toLowerCase(), cvCerts.toLowerCase()) : 0.5;

  let finalScore = (
    weights.skills * skillsScore +
    weights.education * educationScore +
    weights.experience * experienceScore +
    weights.industry * industryScore +
    weights.projects * projScore +
    weights.certifications * certScore
  );
  finalScore = isNaN(finalScore) ? 0 : Math.min(finalScore + (keywordMatch * 0.1), 1.0);
  if (skillsScore > 0.9 && experienceScore > 0.5) finalScore = Math.min(finalScore + 0.05, 1.0);

  const skillSynonyms = {
    'javascript': ['js', 'ecmascript'],
    'python': ['py'],
    'java': ['jvm'],
    'c++': ['cpp'],
    'react': ['reactjs'],
  };
  const skillsGap = jdSkillsFlat.filter(skill => {
    const normalizedSkill = skill.toLowerCase();
    return !cvSkillsFlat.some(cvSkill => {
      const normalizedCvSkill = cvSkill.toLowerCase();
      return normalizedCvSkill === normalizedSkill || 
             (skillSynonyms[normalizedSkill] && skillSynonyms[normalizedSkill].some(syn => syn === normalizedCvSkill));
    });
  });

  const redFlags = [];
  if (safeCvData.experience_details.length > 1) {
    const now = new Date('2025-06-19');
    const durations = safeCvData.experience_details.map(exp => {
      const [startStr, endStr] = exp.duration.split('–').map(s => s.trim());
      let start = new Date(startStr.replace(/(\w+)\s+(\d+)/, '$1 1, $2'));
      let end = endStr === 'Present' || endStr === 'Ongoing' ? now : new Date(endStr.replace(/(\w+)\s+(\d+)/, '$1 1, $2'));
      const diffYears = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
      return diffYears > 0 ? diffYears : 0;
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    if (avgDuration < 0.8) redFlags.push('Potential Job Jumper (average tenure < 0.8 years)');
    const sortedEndDates = safeCvData.experience_details
      .map(exp => {
        const [_, endStr] = exp.duration.split('–').map(s => s.trim());
        return endStr === 'Present' || endStr === 'Ongoing' ? now : new Date(endStr.replace(/(\w+)\s+(\d+)/, '$1 1, $2'));
      })
      .sort((a, b) => a.getTime() - b.getTime());
    if (sortedEndDates.length > 1) {
      const maxGap = sortedEndDates.slice(1).reduce((max, date, i) => {
        const prevDate = sortedEndDates[i];
        const gap = (date - prevDate) / (1000 * 60 * 60 * 24 * 365.25);
        return gap > max ? gap : max;
      }, 0);
      if (maxGap > 1) redFlags.push(`Career Gap Detected (> 1 year between ${sortedEndDates[0].toLocaleDateString()} and ${sortedEndDates[1].toLocaleDateString()})`);
    }
  }

  const highlights = [];
  const cvText = [...safeCvData.skills, ...safeCvData.work_experience, ...safeCvData.projects, ...safeCvData.certifications].join(' ').toLowerCase();
  if (cvText.includes('team leader') || cvText.includes('collaboration') || cvText.includes('teamwork')) highlights.push('Strong Team Collaboration');
  if (cvText.includes('hackathon') || cvText.includes('gsoc') || cvText.includes('google summer of code')) highlights.push('Hackathon/GSOC Achievement');
  const maangCompanies = ['google', 'amazon', 'apple', 'netflix', 'microsoft'];
  if (safeCvData.experience_details.some(exp => maangCompanies.some(co => exp.company.toLowerCase().includes(co) && exp.role.toLowerCase().includes('intern')))) {
    highlights.push('MAANG Internship Experience');
  }

  const quickSummary = `Candidate ${cvData.name} matches ${Math.round(finalScore * 100)}% with JD, strong in ${cvSkillsFlat.slice(0, 3).join(', ')}, but may need ${skillsGap.slice(0, 2).join(', ')}.`;

  console.log('Final Score Components:', { skillsScore, educationScore, experienceScore, industryScore, projScore, certScore, keywordMatch, finalScore });
  return {
    overall_match: Math.round(finalScore * 100),
    skills_match: Math.round(skillsScore * 100),
    education_match: Math.round(educationScore * 100),
    experience_relevance: Math.round(experienceScore * 100),
    industry_relevance: Math.round(industryScore * 100),
    projects_similarity: Math.round(projScore * 100),
    certifications_match: Math.round(certScore * 100),
    keyword_match: Math.round(keywordMatch * 100),
    quick_analysis: {
      summary: quickSummary,
      skills_gap: skillsGap,
      red_flags: redFlags,
      highlights: highlights,
    },
  };
}

module.exports = { calculateMatchScore };