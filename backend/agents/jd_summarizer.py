import json
import re
import requests
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Load Gemini API key and endpoint
GEMINI_API_KEY = "AIzaSyDLG3ObQNfMpftULAT43lLkBQtmUnwZnqs"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

def summarize_job_description(text: str) -> dict:
    """Summarize a job description using the Gemini API."""
    if not text:
        raise ValueError("Job description text is empty")

    # Craft a refined prompt for Gemini API
    prompt = (
        "You are an AI assistant tasked with analyzing a job description. Extract the following information "
        "and return it as a valid JSON object with these exact keys: 'title', 'summary', 'skills', "
        "'responsibilities', 'requirements', 'keywords'. Each value should be a string or a list of strings. "
        "The 'summary' must be a concise, single-sentence overview (max 20 words) of the job role. "
        "If a field cannot be determined, use an appropriate default (e.g., 'Unknown Title' for title, "
        "empty list [] for lists). Do not include any additional text or Markdown formatting outside the JSON object.\n\n"
        "Job Description:\n" + text
    )

    # Send request to Gemini API
    try:
        response = requests.post(
            GEMINI_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }
        )
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Gemini API request failed: {str(e)} - Response: {response.text if response else 'No response'}")
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f"Error from Gemini API: {response.text if response else str(e)}"
        )

    # Parse the response
    try:
        response_data = response.json()
        if "candidates" not in response_data or not response_data["candidates"]:
            raise ValueError("No candidates found in response")
        
        generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Strip Markdown code block if present
        cleaned_text = re.sub(r'^```json\s*|\s*```\s*$', '', generated_text, flags=re.MULTILINE).strip()

        # Parse the cleaned text as JSON
        data = json.loads(cleaned_text)
    except (KeyError, IndexError, json.JSONDecodeError, ValueError) as e:
        logger.error(f"Failed to parse Gemini API response: {str(e)} - Raw response: {response.text}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Gemini API response: {str(e)}. Please check the server logs."
        )

    # Ensure all required fields are present with defaults
    return {
        "title": data.get("title", "Unknown Title"),
        "summary": data.get("summary", "No summary available"),
        "skills": data.get("skills", []),
        "responsibilities": data.get("responsibilities", []),
        "requirements": data.get("requirements", []),
        "keywords": data.get("keywords", []),
        "originalText": text
    }