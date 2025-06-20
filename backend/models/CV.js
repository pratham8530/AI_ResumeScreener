const mongoose = require('mongoose');
const cvSchema = new mongoose.Schema({
  jd_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  name: { type: String, default: 'Unknown' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  skills: { type: [String], default: [] },
  education: {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  experience: { type: Number, default: 0 },
  work_experience: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  projects: { type: [String], default: [] },
  field_of_study: { type: String, default: '' },
  industry: { type: String, default: '' },
  match_score: { type: Number, default: 0 },
  match_breakdown: { type: Object, default: {} },
  experience_details: { type: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
  }], default: [] },
  quick_analysis: { // Add this new field
    summary: { type: String, default: '' },
    skills_gap: { type: [String], default: [] },
    red_flags: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
  },
}, { timestamps: true });

module.exports = mongoose.model('CV', cvSchema);