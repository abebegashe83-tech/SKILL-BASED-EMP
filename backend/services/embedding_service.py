import os
from django.conf import settings
import numpy as np
import torch
import torch.nn.functional as F
from sklearn.feature_extraction.text import TfidfVectorizer
from apps.jobs.models import Job
from apps.users.models import JobseekerProfile

# Try to load sentence-transformers model with local_files_only to avoid rate limiting
model = None
try:
    from sentence_transformers import SentenceTransformer
    hf_token = getattr(settings, 'HF_TOKEN', os.environ.get('HF_TOKEN'))
    model_kwargs = {'local_files_only': True}
    if hf_token:
        model_kwargs['token'] = hf_token
    
    model = SentenceTransformer('all-MiniLM-L6-v2', **model_kwargs)
    print("Loaded sentence-transformers model all-MiniLM-L6-v2 from local cache")
except Exception as e:
    print(f"Could not load sentence-transformers model (will use TF-IDF fallback): {e}")

# TF-IDF fallback for when model is not available
tfidf_vectorizer = None
tfidf_dim = 100

def get_tfidf_embeddings(texts):
    global tfidf_vectorizer
    if tfidf_vectorizer is None:
        tfidf_vectorizer = TfidfVectorizer(max_features=tfidf_dim, stop_words='english')
        tfidf_vectorizer.fit(texts)
    return tfidf_vectorizer.transform(texts).toarray().astype(np.float32)

# Cache matching job.id to (updated_at_timestamp, embedding_vector)
_job_embeddings_cache = {}

SKILL_MAP = {
    "js": "javascript",
    "node": "nodejs",
    "reactjs": "react",
    "ts": "typescript"
}

def preprocess_text(text):
    if not text:
        return ""
    # Lowercase, remove commas, and normalize skills
    text = text.lower().replace(',', ' ')
    words = text.split()
    normalized_words = [SKILL_MAP.get(word, word) for word in words]
    return " ".join(normalized_words).strip()

def enhance_text_with_skills(text, skills):
    """Enhance text by repeating skills twice for increased weight in embeddings"""
    if not text:
        text = ""
    if not skills:
        return text
    
    skills_str = " ".join([preprocess_text(str(s)) for s in skills if s])
    if not skills_str:
        return text
    
    # Repeat skills twice to increase weight
    weighted_skills = f"{skills_str} {skills_str}"
    
    return f"{text} {weighted_skills}".strip()

def encode_jobs(jobs):
    if not jobs:
        return np.array([])
    
    if model is not None:
        embeddings = []
        jobs_to_encode = []
        indices_to_update = []
        
        for idx, job in enumerate(jobs):
            cached = _job_embeddings_cache.get(job.id)
            job_updated_str = str(job.updated_at) if getattr(job, 'updated_at', None) else ''
            
            if cached and cached[0] == job_updated_str:
                embeddings.append(cached[1])
            else:
                embeddings.append(None)
                jobs_to_encode.append(job)
                indices_to_update.append(idx)
                
        if jobs_to_encode:
            new_embeddings = model.encode([job.get_text_representation() for job in jobs_to_encode])
            for job, idx, emb in zip(jobs_to_encode, indices_to_update, new_embeddings):
                job_updated_str = str(job.updated_at) if getattr(job, 'updated_at', None) else ''
                _job_embeddings_cache[job.id] = (job_updated_str, emb)
                embeddings[idx] = emb
                
        return np.array(embeddings)
    else:
        # TF-IDF fallback
        job_texts = [job.get_text_representation() for job in jobs]
        return get_tfidf_embeddings(job_texts)

def encode_user(profile):
    if not profile:
        dim = 384 if model else tfidf_dim  # all-MiniLM-L6-v2 has 384 dimensions
        return np.zeros(dim)
    
    try:
        text = profile.get_text_representation()
        skills = getattr(profile, 'skills', [])
        if not text or not text.strip():
            dim = 384 if model else tfidf_dim
            return np.zeros(dim)
    except AttributeError:
        dim = 384 if model else tfidf_dim
        return np.zeros(dim)
    
    if model is not None:
        dim = model.get_sentence_embedding_dimension()
        # Enhance text with repeated skills for better weighting
        enhanced_text = enhance_text_with_skills(text, skills)
        return model.encode(enhanced_text)
    else:
        # TF-IDF fallback
        return get_tfidf_embeddings([text])[0]
