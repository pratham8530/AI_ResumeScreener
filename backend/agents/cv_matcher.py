import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import re
from typing import Dict, List
from difflib import SequenceMatcher
import spacy

model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load('en_core_web_sm', disable=['ner', 'parser'])

def normalize_text(text: str) -> str:
    return text.lower().strip() if isinstance(text, str) else ""

def fuzzy_match(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def precompute_embeddings(texts: List[str]) -> np.ndarray:
    texts = [normalize_text(t) for t in texts if isinstance(t, str) and t.strip()]
    return model.encode(texts, batch_size=16, show_progress_bar=False) if texts else np.array([])

def skill_similarity(jd_skill_emb, cv_skill_embs, jd_skill_raw, cv_skill_raws, threshold=0.4) -> float:
    if jd_skill_emb.size == 0 or cv_skill_embs.size == 0:
        return 0.0
    cosine_scores = cosine_similarity(jd_skill_emb.reshape(1, -1), cv_skill_embs)[0]
    max_cosine = np.max(cosine_scores)
    if max_cosine >= threshold:
        return max_cosine
    fuzzy_scores = [fuzzy_match(jd_skill_raw, cv) for cv in cv_skill_raws]
    return max(fuzzy_scores, default=0.0)

def calculate_match_score(jd_data: Dict, cv_data: Dict, config: Dict = None) -> Dict[str, float]:
    config = config or {
        'weights': {
            'skills': 0.35,
            'education': 0.15,
            'experience': 0.25,
            'industry': 0.10,
            'projects': 0.10,
            'certifications': 0.05
        }
    }

    weights = config['weights']

    # --- Skills Match ---
    jd_skills = jd_data.get('skills', [])
    cv_skills = cv_data.get('skills', [])
    jd_skills = jd_skills if isinstance(jd_skills, list) else jd_skills.split(',')
    cv_skills = cv_skills if isinstance(cv_skills, list) else cv_skills.split(',')

    jd_skill_embs = precompute_embeddings(jd_skills)
    cv_skill_embs = precompute_embeddings(cv_skills)

    skills_score = 0.0
    if jd_skill_embs.size and cv_skill_embs.size:
        sims = [
            skill_similarity(jd_skill_embs[i], cv_skill_embs, jd_skills[i], cv_skills)
            for i in range(len(jd_skills))
        ]
        skills_score = np.mean(sims)

        # Boost score if strong overlap
        matched = [sim for sim in sims if sim >= 0.6]
        if len(matched) / len(jd_skills) >= 0.75:
            skills_score += 0.1
        skills_score = min(skills_score, 1.0)

    # --- Education Match ---
    edu_levels = {'high school': 1, 'associate': 1.5, 'bachelor': 2, 'master': 3, 'phd': 4, 'doctorate': 4}
    jd_edu = normalize_text(jd_data.get('education', ''))
    cv_edu = normalize_text(cv_data.get('education', ''))

    def extract_level(text):
        for level in edu_levels:
            if level in text:
                return edu_levels[level]
        return 0

    jd_level = extract_level(jd_edu)
    cv_level = extract_level(cv_edu)
    education_score = 1.0 if jd_level == 0 else min(cv_level / jd_level, 1.0)

    jd_field = normalize_text(jd_data.get('field_of_study', ''))
    cv_field = normalize_text(cv_data.get('field_of_study', ''))
    field_score = 1.0
    if jd_field and cv_field:
        emb = model.encode([jd_field, cv_field])
        field_score = cosine_similarity([emb[0]], [emb[1]])[0][0]
    education_score *= 0.6 + 0.4 * field_score

    # --- Experience Match ---
    jd_exp_years = float(jd_data.get('experience', 0))
    cv_exp_years = float(cv_data.get('experience', 0))
    exp_years_score = min(cv_exp_years / jd_exp_years, 1.0) if jd_exp_years > 0 else 1.0

    jd_resp = jd_data.get('responsibilities', '')
    cv_exp = cv_data.get('work_experience', '')

    jd_resp_embs = precompute_embeddings([jd_resp])
    cv_exp_embs = precompute_embeddings([cv_exp])
    resp_score = 0.0
    if jd_resp_embs.size and cv_exp_embs.size:
        resp_score = cosine_similarity(jd_resp_embs, cv_exp_embs)[0][0]

    experience_score = 0.7 * exp_years_score + 0.3 * resp_score

    # Boost for strong alignment
    if exp_years_score >= 0.9 and resp_score >= 0.6:
        experience_score += 0.1
    experience_score = min(experience_score, 1.0)

    # --- Industry Match ---
    jd_industry = normalize_text(" ".join(jd_data.get('industry', [])) if isinstance(jd_data.get('industry'), list) else jd_data.get('industry', ''))
    cv_industry = normalize_text(" ".join(cv_data.get('industry', [])) if isinstance(cv_data.get('industry'), list) else cv_data.get('industry', ''))
    industry_score = 0.5
    if jd_industry and cv_industry:
        emb = model.encode([jd_industry, cv_industry])
        industry_score = cosine_similarity([emb[0]], [emb[1]])[0][0]

    # --- Projects Match ---
    jd_proj = jd_data.get('projects', '')
    cv_proj = cv_data.get('projects', '')
    proj_score = 0.5
    if jd_proj and cv_proj:
        jd_proj_emb = precompute_embeddings([jd_proj])
        cv_proj_emb = precompute_embeddings([cv_proj])
        if jd_proj_emb.size and cv_proj_emb.size:
            proj_score = cosine_similarity(jd_proj_emb, cv_proj_emb)[0][0]

    # --- Certifications Match ---
    jd_certs = jd_data.get('certifications', '')
    cv_certs = cv_data.get('certifications', '')
    cert_score = 0.5
    if jd_certs and cv_certs:
        jd_cert_emb = precompute_embeddings([jd_certs])
        cv_cert_emb = precompute_embeddings([cv_certs])
        if jd_cert_emb.size and cv_cert_emb.size:
            cert_score = cosine_similarity(jd_cert_emb, cv_cert_emb)[0][0]

    # --- Final Weighted Score ---
    final_score = (
        weights['skills'] * skills_score +
        weights['education'] * education_score +
        weights['experience'] * experience_score +
        weights['industry'] * industry_score +
        weights['projects'] * proj_score +
        weights['certifications'] * cert_score
    )

    return {
        'overall_match': round(final_score, 2),
        'skills_match': round(skills_score, 2),
        'education_match': round(education_score, 2),
        'experience_relevance': round(experience_score, 2),
        'industry_relevance': round(industry_score, 2),
        'projects_similarity': round(proj_score, 2),
        'certifications_match': round(cert_score, 2)
    }
