# filepath: /d:/hiring-ai-pilot-main/backend/app.py
import os
import logging
from fastapi import FastAPI, UploadFile, HTTPException
from pdfminer.high_level import extract_text
import docx
from fastapi.middleware.cors import CORSMiddleware
from agents.jd_summarizer import summarize_job_description

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://192.168.1.119:8080"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-jd/")
async def process_job_description(file: UploadFile):
    """Process an uploaded job description file and return structured data."""
    # Supported file types
    supported_types = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.content_type not in supported_types:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # Extract text based on file type
    try:
        if file.content_type == "text/plain":
            text = await file.read()
            text = text.decode("utf-8").strip()
        elif file.content_type == "application/pdf":
            text = extract_text(file.file).strip()
        elif file.content_type in [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]:
            doc = docx.Document(file.file)
            text = "\n".join([para.text for para in doc.paragraphs]).strip()
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        logger.error(f"Text extraction failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to extract text from file")

    if not text:
        raise HTTPException(status_code=400, detail="File content is empty")

    # Use the JD summarizer
    return summarize_job_description(text)