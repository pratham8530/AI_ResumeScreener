import json
import re
import requests
import logging
import sqlite3
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .cv_matcher import calculate_match_score
from pdfminer.high_level import extract_text
import docx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = "AIzaSyDLG3ObQNfMpftULAT43lLkBQtmUnwZnqs"  # Replace with a valid key if needed
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

DB_FILE = "job_descriptions.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            summary TEXT,
            skills TEXT,
            responsibilities TEXT,
            requirements TEXT,
            keywords TEXT,
            education TEXT,
            experience INTEGER,
            projects TEXT,
            field_of_study TEXT,
            industry TEXT,
            original_text TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cvs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jd_id INTEGER,
            name TEXT,
            email TEXT,
            phone TEXT,
            skills TEXT,
            education TEXT,
            experience INTEGER,
            work_experience TEXT,
            certifications TEXT,
            projects TEXT,
            field_of_study TEXT,
            industry TEXT,
            match_score REAL,
            match_breakdown TEXT,
            experience_details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_jd_to_db(jd_data: dict):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    serialized_jd_data = {
        'title': jd_data['title'],
        'summary': jd_data['summary'],
        'skills': json.dumps(jd_data['skills']),
        'responsibilities': json.dumps(jd_data['responsibilities']),
        'requirements': json.dumps(jd_data['requirements']),
        'keywords': json.dumps(jd_data['keywords']),
        'education': json.dumps(jd_data['education']),
        'experience': jd_data['experience'],
        'projects': json.dumps(jd_data['projects']),
        'field_of_study': jd_data['field_of_study'],
        'industry': jd_data['industry'],
        'originalText': jd_data['originalText']
    }
    try:
        cursor.execute('''
            INSERT INTO job_descriptions (
                title, summary, skills, responsibilities, requirements, keywords,
                education, experience, projects, field_of_study, industry, original_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            serialized_jd_data['title'],
            serialized_jd_data['summary'],
            serialized_jd_data['skills'],
            serialized_jd_data['responsibilities'],
            serialized_jd_data['requirements'],
            serialized_jd_data['keywords'],
            serialized_jd_data['education'],
            serialized_jd_data['experience'],
            serialized_jd_data['projects'],
            serialized_jd_data['field_of_study'],
            serialized_jd_data['industry'],
            serialized_jd_data['originalText']
        ))
        jd_id = cursor.lastrowid
        conn.commit()
        logger.debug(f"JD saved with ID: {jd_id}")
        return jd_id
    except sqlite3.Error as e:
        logger.error(f"Database error while saving JD: {str(e)}")
        raise
    finally:
        conn.close()

def save_cv_to_db(jd_id: int, cv_data: dict, match_score: float, match_breakdown: dict, experience_details: list):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    education = cv_data['education']
    if isinstance(education, (list, dict)):
        education = json.dumps(education)
    # Serialize experience_details as JSON
    experience_details_json = json.dumps(experience_details) if experience_details else "[]"
    try:
        cursor.execute('''
            INSERT INTO cvs (
                jd_id, name, email, phone, skills, education, experience, work_experience,
                certifications, projects, field_of_study, industry, match_score, match_breakdown, experience_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            jd_id,
            cv_data['name'],
            cv_data['email'],
            cv_data['phone'],
            json.dumps(cv_data['skills']),
            education,
            int(cv_data['experience']),
            json.dumps(cv_data['work_experience']),
            json.dumps(cv_data['certifications']),
            json.dumps(cv_data['projects']),
            cv_data['field_of_study'],
            cv_data['industry'],
            match_score,
            json.dumps(match_breakdown),
            experience_details_json  # Now serialized
        ))
        conn.commit()
        logger.debug(f"CV saved with JD ID {jd_id} for {cv_data['name']}")
    except sqlite3.Error as e:
        logger.error(f"Database error while saving CV: {str(e)}", exc_info=True)
        raise
    finally:
        conn.close()

def summarize_job_description(text: str) -> tuple[dict, int]:
    if not text:
        raise ValueError("Job description text is empty")

    prompt = (
        "You are an AI assistant tasked with analyzing a job description. Extract the following information "
        "and return it as a valid JSON object with these exact keys: 'title', 'summary', 'skills', "
        "'responsibilities', 'requirements', 'keywords', 'education', 'experience', 'projects', "
        "'field_of_study', 'industry'. 'skills', 'responsibilities', 'requirements', 'keywords', and 'projects' "
        "must be lists of strings. 'education' should be an object with 'institution' (string), 'degree' (string), "
        "and 'gpa' (string or number) if available, or an empty string if not applicable. 'experience' must be "
        "an integer (years of experience, default to 0 if unclear). The 'summary' must be a concise description "
        "of the job role. If a field cannot be determined, use appropriate defaults (e.g., 'Unknown Title' for title, "
        "empty list [] for lists, '' for strings, 0 for experience). Do not include any additional "
        "text or Markdown formatting outside the JSON object.\n\n"
        "Job Description:\n" + text
    )

    try:
        logger.info("Sending request to Gemini API for JD")
        response = requests.post(
            GEMINI_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            }
        )
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Gemini API request failed for JD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error from Gemini API: {str(e)}")

    try:
        response_data = response.json()
        generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned_text = re.sub(r'^```json\s*|\s*```\s*$', '', generated_text, flags=re.MULTILINE).strip()
        data = json.loads(cleaned_text)
        logger.debug(f"Raw Gemini response data for JD: {data}")
    except (KeyError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse Gemini API response for JD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse response: {str(e)}")

    education = data.get("education", {})
    if not isinstance(education, dict):
        education = {"institution": "", "degree": "", "gpa": ""} if not education else {"institution": str(education), "degree": "", "gpa": ""}

    jd_data = {
        "title": data.get("title", "Unknown Title"),
        "summary": data.get("summary", ""),
        "skills": data.get("skills", []),
        "responsibilities": data.get("responsibilities", []),
        "requirements": data.get("requirements", []),
        "keywords": data.get("keywords", []),
        "education": education,
        "experience": data.get("experience", 0),
        "projects": data.get("projects", []),
        "field_of_study": data.get("field_of_study", ""),
        "industry": data.get("industry", ""),
        "originalText": text
    }
    logger.debug(f"JD data before saving: {jd_data}")
    jd_id = save_jd_to_db(jd_data)
    return jd_data, jd_id

def parse_cv(text: str) -> dict:
    if not text:
        logger.warning("Empty CV text provided")
        return {
            "name": "Unknown",
            "email": "",
            "phone": "",
            "skills": [],
            "education": {"institution": "", "degree": "", "gpa": ""},
            "experience": 0,
            "work_experience": [],
            "certifications": [],
            "projects": [],
            "field_of_study": "",
            "industry": "",
            "experience_details": []
        }

    prompt = (
        "You are an AI assistant tasked with analyzing a CV. Extract the following information "
        "and return it as a valid JSON object with these exact keys: 'name', 'email', 'phone', "
        "'skills', 'education', 'experience', 'work_experience', 'certifications', 'projects', "
        "'field_of_study', 'industry', 'experience_details'. 'experience_details' should be a list "
        "of objects with 'company', 'role', and 'duration' keys. 'education' should be an object with "
        "'institution' (string), 'degree' (string), and 'gpa' (string or number) if available, or an empty string if not applicable. "
        "Each value should be a string or a list of strings, except 'experience' which should be an integer "
        "(years of experience, default 0 if unclear). If a field cannot be determined, use appropriate defaults "
        "(e.g., 'Unknown' for name, empty list [] for lists, '' for strings, 0 for experience). "
        "Do not include any additional text or Markdown formatting outside the JSON object.\n\n"
        "CV Text:\n" + text
    )

    try:
        logger.info("Sending request to Gemini API for CV")
        response = requests.post(
            GEMINI_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            }
        )
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Gemini API request failed for CV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error from Gemini API: {str(e)}")

    try:
        response_data = response.json()
        generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
        cleaned_text = re.sub(r'^```json\s*|\s*```\s*$', '', generated_text, flags=re.MULTILINE).strip()
        data = json.loads(cleaned_text)
        logger.debug(f"Raw Gemini response data for CV: {data}")
    except (KeyError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse Gemini API response for CV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse response: {str(e)}")

    experience_raw = data.get("experience", 0)
    logger.info(f"Raw experience data for CV: {experience_raw}")
    if isinstance(experience_raw, list):
        exp_str = str(experience_raw[0]) if experience_raw else "0"
        experience = int(re.search(r'\d+', exp_str).group()) if re.search(r'\d+', exp_str) else 0
    elif isinstance(experience_raw, str):
        experience = int(re.search(r'\d+', experience_raw).group()) if re.search(r'\d+', experience_raw) else 0
    elif isinstance(experience_raw, (int, float)):
        experience = int(experience_raw)
    else:
        logger.warning(f"Unexpected experience type: {type(experience_raw)}, value: {experience_raw}")
        experience = 0

    education = data.get("education", {})
    if not isinstance(education, dict):
        education = {"institution": "", "degree": "", "gpa": ""} if not education else {"institution": str(education), "degree": "", "gpa": ""}

    cv_data = {
        "name": data.get("name", "Unknown"),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "skills": data.get("skills", []),
        "education": education,
        "experience": experience,
        "work_experience": data.get("work_experience", []),
        "certifications": data.get("certifications", []),
        "projects": data.get("projects", []),
        "field_of_study": data.get("field_of_study", ""),
        "industry": data.get("industry", ""),
        "experience_details": data.get("experience_details", [])
    }
    logger.info(f"Processed CV data: {cv_data}")
    return cv_data

async def process_cvs(jd_id: int, files: List[UploadFile]):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM job_descriptions WHERE id = ?", (jd_id,))
    jd_row = cursor.fetchone()
    conn.close()

    if not jd_row:
        raise HTTPException(status_code=404, detail="JD not found")

    jd_data = {
        "skills": json.loads(jd_row[3]) if jd_row[3] else [],
        "education": json.loads(jd_row[7]) if jd_row[7] else {},
        "experience": jd_row[8],
        "responsibilities": json.loads(jd_row[4]) if jd_row[4] else [],
        "projects": json.loads(jd_row[9]) if jd_row[9] else [],
        "field_of_study": jd_row[10],
        "summary": jd_row[2],
        "requirements": json.loads(jd_row[5]) if jd_row[5] else [],
        "industry": jd_row[11]
    }
    logger.debug(f"Retrieved JD data for matching: {jd_data}")

    processed_cvs = []
    supported_types = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    for file in files:
        logger.info(f"Processing file: {file.filename}, type: {file.content_type}, size: {file.size} bytes")
        if file.content_type not in supported_types:
            logger.warning(f"Unsupported file type for {file.filename}: {file.content_type}")
            continue

        try:
            content = await file.read()
            if file.content_type == "text/plain":
                text = content.decode('utf-8').strip()
                logger.debug(f"Extracted text (plain): {text[:500]}...")
            elif file.content_type == "application/pdf":
                text = extract_text(file.file).strip()
                logger.debug(f"Extracted PDF text: {text[:500]}...")
            elif file.content_type in [
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ]:
                doc = docx.Document(file.file)
                text = "\n".join([para.text for para in doc.paragraphs]).strip()
                logger.debug(f"Extracted DOCX text: {text[:500]}...")
            else:
                logger.error(f"Unexpected file type: {file.content_type}")
                continue

            if not text:
                logger.warning(f"Empty content in {file.filename}")
                continue

            cv_data = parse_cv(text)
            logger.debug(f"CV data before matching: {cv_data}")
            scores = calculate_match_score(jd_data, cv_data)
            match_score = scores['overall_match'] * 100
            match_breakdown = {
                "skills": scores['skills_match'] * 100,
                "experience": scores['experience_relevance'] * 100,
                "education": scores['education_match'] * 100,
                "industryRelevance": scores['industry_relevance'] * 100
            }
            experience_details = cv_data.pop("experience_details", [])
            try:
                save_cv_to_db(jd_id, cv_data, match_score, match_breakdown, experience_details)
                processed_cvs.append({
                    "id": len(processed_cvs) + 1,
                    "name": cv_data['name'],
                    "email": cv_data['email'],
                    "phone": cv_data['phone'],
                    "skills": cv_data['skills'],
                    "education": cv_data['education'],
                    "experience": cv_data['experience'],
                    "experienceDetails": experience_details,
                    "matchScore": round(match_score, 2),
                    "matchBreakdown": match_breakdown
                })
                logger.info(f"Successfully processed CV: {cv_data['name']} with match score {match_score}%")
            except sqlite3.Error as e:
                logger.error(f"Database error for {cv_data['name']}: {str(e)}, but adding to response anyway", exc_info=True)
                processed_cvs.append({
                    "id": len(processed_cvs) + 1,
                    "name": cv_data['name'],
                    "email": cv_data['email'],
                    "phone": cv_data['phone'],
                    "skills": cv_data['skills'],
                    "education": cv_data['education'],
                    "experience": cv_data['experience'],
                    "experienceDetails": experience_details,
                    "matchScore": round(match_score, 2),
                    "matchBreakdown": match_breakdown
                })
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {str(e)}", exc_info=True)
            continue

    logger.info(f"Final processed_cvs before return: {processed_cvs}")
    return {"processed_cvs": processed_cvs, "success": True}

init_db()