const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(file) {
  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8').trim();
  } else if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text.trim();
  } else if (file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.trim();
  }
  throw new Error('Unsupported file format');
}

module.exports = { extractText };