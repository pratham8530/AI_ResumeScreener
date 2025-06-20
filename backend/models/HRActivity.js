const mongoose = require('mongoose');

const hrActivitySchema = new mongoose.Schema({
  jdId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  shortlistedCandidates: [{
    id: String,
    name: String,
    email: String,
    phone: String,
    experience: Number,
    education: {
      institution: String,
      degree: String,
      gpa: String,
    },
    skills: [String],
    experienceDetails: [{
      company: String,
      role: String,
      duration: String,
    }],
    matchScore: Number,
    matchBreakdown: {
      skills: Number,
      experience: Number,
      education: Number,
      industryRelevance: Number,
      projects: Number,
      certifications: Number,
      keywordMatch: Number,
    },
    quick_analysis: {
      summary: String,
      skills_gap: [String],
      red_flags: [String],
      highlights: [String],
    },
    currentStatus: { type: String, default: "Pending" },
  }],
  date: { type: String, required: true },
});

module.exports = mongoose.model('HRActivity', hrActivitySchema);