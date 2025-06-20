const mongoose = require('mongoose');

const jdSchema = new mongoose.Schema({
  title: { type: String, default: 'Unknown Title' },
  summary: { type: String, default: '' },
  skills: { type: [{
    skill: { type: String, required: true },
    variants: { type: [String], default: [] },
  }], default: [] },
  responsibilities: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
  education: {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  experience: { type: Number, default: 0 },
  projects: { type: [String], default: [] },
  field_of_study: { type: String, default: '' },
  industry: { type: String, default: '' },
  originalText: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('JobDescription', jdSchema);