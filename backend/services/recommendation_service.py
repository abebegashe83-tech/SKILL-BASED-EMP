import torch
import torch.nn.functional as F
import numpy as np
import os
import sys
from apps.jobs.models import Job

# Add ai_service to path for CV parsing
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AI_SERVICE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ai_service'))
if AI_SERVICE_PATH not in sys.path:
    sys.path.append(AI_SERVICE_PATH)

from .embedding_service import model

# ── Domain Definitions ─────────────────────────────────────────────────────
TECH_DOMAIN = ["react", "nodejs", "python", "javascript", "django", "java", "spring", "angular", "vue", "typescript", "golang", "rust", "kubernetes", "docker", "aws", "azure", "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "graphql", "rest", "api", "microservices", "devops", "ci/cd", "git", "linux", "agile", "scrum", "machine learning", "data science", "deep learning", "nlp", "ai"]
HEALTH_DOMAIN = ["nurse", "doctor", "medical", "clinic", "patient", "healthcare", "hospital", "surgery", "pharmacy", "medicine", "diagnosis", "treatment", "clinical", "physician", "surgeon", "dentist", "pharmacist", "radiology", "pathology", "oncology", "cardiology", "neurology", "pediatrics", "emergency", "triage", "vitals", "cpr", "epidemiology", "public health"]
BUSINESS_DOMAIN = ["sales", "marketing", "finance", "accounting", "management", "hr", "recruiting", "consulting", "strategy", "operations", "logistics", "supply chain", "procurement", "customer service", "business development", "partnerships", "revenue", "profit", "budgeting", "forecasting", "financial planning", "investment", "banking", "insurance", "real estate", "compliance", "auditing", "risk management"]

# ── Multi-Domain Skill Relationship Map ─────────────────────────────────────────────────────
# Maps skills to their related technologies for improved matching across multiple domains
SKILL_MAP = {
    # ======================
    # HEALTHCARE
    # ======================
    'nursing': ['patient care', 'clinical skills', 'vital signs', 'healthcare', 'medical'],
    'patient care': ['nursing', 'caregiving', 'clinical support', 'healthcare'],
    'clinical skills': ['nursing', 'medical procedures', 'healthcare'],
    'medical assistant': ['patient care', 'clinical support', 'healthcare'],
    'pharmacy': ['medication', 'pharmacology', 'healthcare'],
    'pharmacology': ['pharmacy', 'medication', 'healthcare'],
    'doctor': ['diagnosis', 'treatment', 'medical', 'healthcare'],
    'diagnosis': ['doctor', 'clinical analysis', 'medical'],
    'laboratory': ['lab technician', 'medical testing', 'healthcare'],
    'lab technician': ['laboratory', 'testing', 'medical'],
    'public health': ['epidemiology', 'healthcare', 'medical'],
    'epidemiology': ['public health', 'data analysis', 'healthcare'],
    'caregiver': ['patient care', 'nursing', 'healthcare'],
    'radiology': ['medical imaging', 'x-ray', 'diagnostics'],
    'x-ray': ['radiology', 'medical imaging', 'diagnostics'],
    'medical imaging': ['radiology', 'x-ray', 'diagnostics', 'medical'],
    'diagnostics': ['radiology', 'medical imaging', 'x-ray', 'doctor', 'medical'],
    'vital signs': ['nursing', 'patient care', 'healthcare'],
    'medical procedures': ['clinical skills', 'nursing', 'healthcare'],
    'clinical support': ['medical assistant', 'patient care', 'healthcare'],
    'medication': ['pharmacy', 'pharmacology', 'healthcare'],
    'medical': ['doctor', 'nursing', 'healthcare', 'diagnosis'],
    'testing': ['laboratory', 'lab technician', 'medical'],
    'healthcare': ['nursing', 'doctor', 'medical assistant', 'pharmacy'],

    # ======================
    # ENGINEERING
    # ======================
    'civil engineering': ['construction', 'structural design', 'engineering'],
    'mechanical engineering': ['machines', 'design', 'engineering'],
    'electrical engineering': ['circuits', 'electronics', 'engineering'],
    'software engineering': ['programming', 'development', 'engineering'],
    'construction': ['civil engineering', 'project management', 'engineering'],
    'structural design': ['civil engineering', 'engineering'],
    'cad': ['design', 'engineering', 'autocad'],
    'autocad': ['cad', 'design', 'engineering'],
    'machines': ['mechanical engineering', 'engineering'],
    'design': ['cad', 'autocad', 'mechanical engineering', 'engineering'],
    'circuits': ['electrical engineering', 'engineering'],
    'electronics': ['electrical engineering', 'engineering'],
    'programming': ['software engineering', 'development'],
    'development': ['software engineering', 'programming'],
    'engineering': ['civil engineering', 'mechanical engineering', 'electrical engineering', 'software engineering'],
    'project management': ['construction', 'engineering', 'management'],

    # ======================
    # BUSINESS / MANAGEMENT
    # ======================
    'management': ['leadership', 'operations', 'business'],
    'project management': ['planning', 'coordination', 'management'],
    'marketing': ['branding', 'advertising', 'business'],
    'sales': ['negotiation', 'customer service', 'business'],
    'finance': ['accounting', 'budgeting', 'business'],
    'accounting': ['finance', 'bookkeeping', 'business'],
    'human resources': ['recruitment', 'employee relations', 'hr'],
    'recruitment': ['hr', 'hiring', 'human resources'],
    'customer service': ['communication', 'support', 'business'],
    'leadership': ['management', 'business'],
    'operations': ['management', 'business'],
    'planning': ['project management', 'management'],
    'coordination': ['project management', 'management'],
    'branding': ['marketing', 'business'],
    'advertising': ['marketing', 'business'],
    'negotiation': ['sales', 'business'],
    'budgeting': ['finance', 'business'],
    'bookkeeping': ['accounting', 'finance'],
    'employee relations': ['human resources', 'hr'],
    'hiring': ['recruitment', 'human resources'],
    'communication': ['customer service', 'business'],
    'support': ['customer service', 'business'],
    'hr': ['human resources', 'recruitment'],
    'business': ['management', 'marketing', 'sales', 'finance', 'accounting'],

    # ======================
    # EDUCATION
    # ======================
    'teaching': ['education', 'classroom management', 'tutoring'],
    'education': ['teaching', 'training', 'learning'],
    'classroom management': ['teaching', 'education'],
    'training': ['education', 'coaching', 'teaching'],
    'tutoring': ['teaching', 'education'],
    'learning': ['education', 'training'],
    'coaching': ['training', 'education', 'teaching'],

    # ======================
    # TECH
    # ======================
    'python': ['django', 'flask', 'fastapi', 'backend', 'data science'],
    'django': ['python', 'backend', 'rest api', 'drf'],
    'flask': ['python', 'backend', 'rest'],
    'fastapi': ['python', 'api', 'async'],
    'react': ['javascript', 'frontend', 'next.js', 'redux', 'jsx'],
    'next.js': ['react', 'frontend', 'ssr'],
    'node': ['express', 'backend', 'node.js'],
    'node.js': ['express', 'nestjs', 'javascript', 'backend', 'rest api', 'nodejs'],
    'express': ['node.js', 'backend', 'api', 'javascript', 'express.js'],
    'sql': ['database', 'postgresql', 'mysql'],
    'database': ['sql', 'postgresql', 'mysql', 'mongodb'],
    'postgresql': ['sql', 'database', 'postgres'],
    'mysql': ['sql', 'database'],
    'mongodb': ['nosql', 'database', 'mongo'],
    'javascript': ['react', 'node.js', 'express', 'frontend', 'backend'],
    'backend': ['python', 'django', 'flask', 'node.js', 'express', 'fastapi'],
    'frontend': ['react', 'javascript', 'next.js', 'vue', 'angular'],
    'data science': ['python', 'pandas', 'numpy', 'machine learning'],
    'machine learning': ['python', 'tensorflow', 'pytorch', 'data science'],
    'tensorflow': ['python', 'machine learning', 'deep learning'],
    'pytorch': ['python', 'machine learning', 'deep learning'],
    'pandas': ['python', 'data science', 'numpy'],
    'numpy': ['python', 'data science', 'pandas'],
    'rest api': ['backend', 'api', 'django', 'express'],
    'api': ['rest api', 'backend', 'graphql'],
    'graphql': ['api', 'backend', 'javascript'],
    'docker': ['devops', 'container', 'kubernetes'],
    'kubernetes': ['docker', 'devops', 'k8s'],
    'devops': ['docker', 'kubernetes', 'ci/cd'],
    'ci/cd': ['devops', 'docker'],
    'aws': ['cloud', 'devops'],
    'cloud': ['aws', 'azure', 'gcp', 'devops'],
    'java': ['spring', 'spring boot', 'backend'],
    'spring': ['java', 'spring boot', 'backend'],
    'spring boot': ['java', 'spring', 'backend'],
    'typescript': ['angular', 'react', 'frontend'],
    'angular': ['typescript', 'frontend'],
    'vue': ['javascript', 'frontend'],
    'nest.js': ['node.js', 'typescript', 'backend'],
    'rest': ['rest api', 'backend', 'api'],
    'drf': ['django', 'python', 'backend'],
    'async': ['fastapi', 'python', 'backend'],
    'ssr': ['next.js', 'react', 'frontend'],
    'redux': ['react', 'javascript', 'frontend'],
    'jsx': ['react', 'javascript', 'frontend'],
    'nodejs': ['node.js', 'express', 'javascript', 'backend'],
    'express.js': ['express', 'node.js', 'javascript', 'backend'],
    'nosql': ['mongodb', 'database'],
    'mongo': ['mongodb', 'nosql', 'database'],
    'postgres': ['postgresql', 'sql', 'database'],
    'k8s': ['kubernetes', 'devops', 'docker'],
    'deep learning': ['tensorflow', 'pytorch', 'machine learning', 'python'],
}


def _normalize_skill(skill):
    """Normalize skill names to canonical forms."""
    if not skill:
        return skill
    
    skill_lower = skill.lower().strip()
    
    # Remove punctuation
    import string
    skill_lower = skill_lower.translate(str.maketrans('', '', string.punctuation))
    
    # Additional normalizations
    normalizations = {
        'nodejs': 'node.js',
        'js': 'javascript',
        'ts': 'typescript',
        'reactjs': 'react',
        'vuejs': 'vue',
        'angularjs': 'angular',
        'postgres': 'postgresql',
        'mongo': 'mongodb',
        'k8s': 'kubernetes',
        'express.js': 'express',
        'nextjs': 'next.js',
        'nest.js': 'nestjs',
        'drf': 'django rest framework',
    }
    
    return normalizations.get(skill_lower, skill_lower)


def _normalize_skills(skills):
    """Normalize a list of skills."""
    if not skills:
        return []
    return [_normalize_skill(s) for s in skills if s]


def _build_taxonomy():
    """Build a bidirectional lookup: skill → set of related skills (normalized)."""
    taxonomy = {}
    for skill, related in SKILL_MAP.items():
        key = skill.lower()
        normalized_related = [_normalize_skill(r) for r in related]
        taxonomy.setdefault(key, set()).update(normalized_related)
        # Add reverse edges
        for r in normalized_related:
            rkey = _normalize_skill(r)
            taxonomy.setdefault(rkey, set()).add(key)
    return taxonomy

# Rebuild taxonomy with updated SKILL_MAP
_TAXONOMY = _build_taxonomy()


def _detect_domain(skills):
    """Detect the domain of a user or job based on their skills."""
    if not skills:
        return "other"
    
    skills_lower = [skill.lower() for skill in skills]
    
    tech_count = sum(1 for skill in skills_lower if any(tech in skill for tech in TECH_DOMAIN))
    health_count = sum(1 for skill in skills_lower if any(health in skill for health in HEALTH_DOMAIN))
    business_count = sum(1 for skill in skills_lower if any(biz in skill for biz in BUSINESS_DOMAIN))
    
    # Tech domain requires at least 1 keyword, others require 2
    if tech_count >= 1:
        return "tech"
    elif health_count >= 2:
        return "health"
    elif business_count >= 2:
        return "business"
    else:
        return "other"


def _skill_overlap_score(profile_skills, job_required_skills):
    """
    Job-centric skill coverage score.

    For each job skill, we check:
      1. Exact match with a profile skill   → weight 1.0
      2. Related match via taxonomy         → weight 0.6
    Score = weighted_hits / len(job_skills)

    Denominator is ONLY the job's skill count so that:
      - Each job's score is independent of other jobs
      - Adding user skills can only help, never hurt another job's score
    """
    if not profile_skills or not job_required_skills:
        return 0.0

    profile_norm = _normalize_skills(profile_skills)
    job_norm = _normalize_skills(job_required_skills)

    profile_set = {s for s in profile_norm if s}
    job_set = {s for s in job_norm if s}

    if not profile_set or not job_set:
        return 0.0

    weighted_hits = 0.0
    for js in job_set:
        if js in profile_set:
            weighted_hits += 1.0          # exact match
        else:
            related = _TAXONOMY.get(js, set())
            if related & profile_set:     # at least one profile skill is related
                weighted_hits += 0.6      # partial credit for taxonomy match

    # Use job_set size as denominator: "what % of THIS job's requirements does the user cover?"
    return min(1.0, weighted_hits / len(job_set))


def _is_direct_or_related(u, j):
    """
    Check if skills are directly related or bidirectionally related through SKILL_MAP.
    """
    if u == j:
        return True
    
    if j in SKILL_MAP.get(u, []):
        return True
    
    if u in SKILL_MAP.get(j, []):
        return True
    
    return False


def _has_any_match(user_skills, job_skills):
    """
    STRICT MATCH CHECK: Returns True only if at least one user skill has a direct or related match with job skills.
    This prevents cross-domain matches (e.g., Django vs healthcare).
    """
    if not user_skills or not job_skills:
        return False
    
    user_norm = _normalize_skills(user_skills)
    job_norm = _normalize_skills(job_skills)
    
    user_set = {s for s in user_norm if s}
    job_set = {s for s in job_norm if s}
    
    if not user_set or not job_set:
        return False
    
    for u in user_set:
        for j in job_set:
            if _is_direct_or_related(u, j):
                return True
    
    return False


def _is_related(u, j):
    """
    Multi-hop matching: check if skills are related directly or through one intermediate.
    """
    if j in SKILL_MAP.get(u, []):
        print(f"[RELATED MATCH FOUND]: {u} -> {j} (direct)")
        return True
    
    # Check second-level relation
    for mid in SKILL_MAP.get(u, []):
        if j in SKILL_MAP.get(mid, []):
            print(f"[RELATED MATCH FOUND]: {u} -> {mid} -> {j} (multi-hop)")
            return True
    
    return False


def _related_score(user_skills, job_skills):
    """
    Calculate related skill match score using SKILL_MAP with strict domain control.
    
    For each user skill and job skill pair:
      - Exact match: +1.0
      - Job skill in user's related skills: +0.7
      - User skill in job's related skills: +0.7
    
    If NO relationship exists between any skills, return 0 to avoid cross-domain noise.
    
    Returns normalized score between 0 and 1, direct matches, related matches, and exact_match flag.
    """
    if not user_skills or not job_skills:
        return 0.0, [], [], False
    
    user_norm = _normalize_skills(user_skills)
    job_norm = _normalize_skills(job_skills)
    
    user_set = {s for s in user_norm if s}
    job_set = {s for s in job_norm if s}
    
    if not user_set or not job_set:
        return 0.0, [], [], False
    
    # STEP 2 — FIX EXACT MATCH LOGIC (ONLY EXACT STRING EQUALITY)
    exact_match = any(u == j for u in user_set for j in job_set)
    
    score = 0.0
    direct_matches = []
    related_matches = []
    
    for u in user_set:
        for j in job_set:
            if u == j:
                score += 1.0
                if u not in direct_matches:
                    direct_matches.append(u)
            elif _is_related(u, j):
                score += 0.7
                if (u, j) not in related_matches:
                    related_matches.append((u, j))
    
    # STEP 6 — STRICT ZERO RULE
    if score == 0.0:
        return 0.0, [], [], False
    
    # Normalize by job skills count
    normalized_score = score / max(len(job_set), 1)
    
    # STEP 1 — DEBUG LOG
    print(f"[RELATED] user_skills={user_set}, job_skills={job_set}, exact_match={exact_match}, score={score:.3f}, normalized={normalized_score:.3f}")
    
    return min(1.0, normalized_score), direct_matches, related_matches, exact_match


def _boost_related_skills(user_skills, job_skills, semantic_score):
    """
    Boost semantic score for strongly related technology pairs.
    """
    if not user_skills or not job_skills:
        return semantic_score, ""
    
    user_norm = _normalize_skills(user_skills)
    job_norm = _normalize_skills(job_skills)
    
    user_set = {s for s in user_norm if s}
    job_set = {s for s in job_norm if s}
    
    boost = 0.0
    reason = ""
    
    # Boost for Node.js + Express.js (strongly related backend technologies)
    if 'express' in user_set and ('node' in job_set or 'node.js' in job_set):
        boost += 0.3
        reason = "Node.js and Express.js are strongly related backend technologies"
    
    # Boost for Node.js + JavaScript
    if ('node' in user_set or 'node.js' in user_set) and 'javascript' in job_set:
        boost += 0.2
        reason = "Node.js and JavaScript are strongly related"
    
    # Boost for Express + JavaScript
    if 'express' in user_set and 'javascript' in job_set:
        boost += 0.15
        reason = "Express and JavaScript are strongly related"
    
    # Boost if both have Node.js and JavaScript
    if ('node' in user_set or 'node.js' in user_set) and 'javascript' in user_set:
        if ('node' in job_set or 'node.js' in job_set):
            boost += 0.2
            reason = "Node.js and JavaScript backend stack match"
    
    # Boost for Python + Django
    if 'python' in user_set and 'django' in job_set:
        boost += 0.3
        reason = "Python and Django are strongly related"
    
    # Boost for Django + Python
    if 'django' in user_set and 'python' in job_set:
        boost += 0.3
        reason = "Django and Python are strongly related"
    
    # Boost for React + JavaScript
    if 'react' in user_set and 'javascript' in job_set:
        boost += 0.2
        reason = "React and JavaScript are strongly related"
    
    # Boost for JavaScript + React
    if 'javascript' in user_set and 'react' in job_set:
        boost += 0.2
        reason = "JavaScript and React are strongly related"
    
    boosted_score = min(1.0, semantic_score + boost)
    return boosted_score, reason


def _semantic_skill_match(user_skills, job_skills):
    """
    Job-centric semantic skill coverage.

    For each JOB skill, find the best-matching user skill via semantic similarity.
    Average across job skills.

    This is job-centric so adding user skills can only help (never hurt) a job's score.
    """
    if not user_skills or not job_skills:
        return 0.0
    
    if model is None:
        return 0.0
    
    user_norm = _normalize_skills(user_skills)
    job_norm = _normalize_skills(job_skills)
    
    user_skill_embeddings = model.encode(user_norm)
    job_skill_embeddings = model.encode(job_norm)
    
    user_skill_tensor = torch.FloatTensor(user_skill_embeddings)
    job_skill_tensor = torch.FloatTensor(job_skill_embeddings)
    
    # For each JOB skill, find the best matching USER skill
    job_coverage_scores = []
    for job_emb in job_skill_tensor:
        similarities = F.cosine_similarity(
            job_emb.unsqueeze(0), 
            user_skill_tensor, 
            dim=1
        )
        max_sim = float(torch.max(similarities))
        # Normalize from -1→1 to 0→1
        normalized_sim = (max_sim + 1) / 2
        job_coverage_scores.append(normalized_sim)
    
    return np.mean(job_coverage_scores)


def _boost_related_skills(user_skills, job_skills, semantic_score):
    """
    Boost semantic score for strongly related technology pairs.
    """
    if not user_skills or not job_skills:
        return semantic_score
    
    user_norm = _normalize_skills(user_skills)
    job_norm = _normalize_skills(job_skills)
    
    user_set = {s for s in user_norm if s}
    job_set = {s for s in job_norm if s}
    
    boost = 0.0
    reason = ""
    
    # Boost for Node.js + Express.js (strongly related backend technologies)
    if 'express' in user_set and ('node' in job_set or 'node.js' in job_set):
        boost += 0.3
        reason = "Node.js and Express.js are strongly related backend technologies"
    
    # Boost for Node.js + JavaScript
    if ('node' in user_set or 'node.js' in user_set) and 'javascript' in job_set:
        boost += 0.2
        reason = "Node.js and JavaScript are strongly related"
    
    # Boost for Express + JavaScript
    if 'express' in user_set and 'javascript' in job_set:
        boost += 0.15
        reason = "Express and JavaScript are strongly related"
    
    # Boost if both have Node.js and JavaScript
    if ('node' in user_set or 'node.js' in user_set) and 'javascript' in user_set:
        if ('node' in job_set or 'node.js' in job_set):
            boost += 0.2
            reason = "Node.js and JavaScript backend stack match"
    
    boosted_score = min(1.0, semantic_score + boost)
    return boosted_score, reason

def experience_score(user_exp, job_exp_required):
    if not job_exp_required:
        return 1.0
    if not user_exp:
        return 0.0
    if isinstance(user_exp, str):
        try:
            # simple attempt to parse just in case it's a string like "3 years"
            import re
            m = re.search(r'(\d+)', user_exp)
            user_exp = int(m.group(1)) if m else 0
        except:
            user_exp = 0
            
    if isinstance(job_exp_required, str):
        try:
            import re
            m = re.search(r'(\d+)', job_exp_required)
            job_exp_required = int(m.group(1)) if m else 0
        except:
            return 1.0

    if job_exp_required == 0:
        return 1.0
    
    if user_exp >= job_exp_required:
        return 1.0
    else:
        return user_exp / float(job_exp_required)

def _hybrid_score(skill_overlap, related_score, embedding_score, exp_score=1.0, domain_penalty=1.0, exact_match=False):
    """
    Fully job-centric scoring — NO global user embedding.
    Weights: 45% embedding_score + 30% overlap_score + 25% related_score.
    Applies domain penalty.
    Scales the result to an integer percentage (0-100).

    CRITICAL: If exact_match == False, hard cap final score at 85%.
    """
    # STEP 3 — NORMALIZE COMPONENTS
    embedding_score = min(max(embedding_score, 0), 1)
    overlap_score = min(max(skill_overlap, 0), 1)
    related_score = min(max(related_score, 0), 1)
    
    # STEP 5 — FORCE RELATED LIMIT
    if not exact_match:
        if related_score > 0.8:
            related_score = 0.8
    
    # STEP 4 — FINAL WEIGHTED SCORE
    final_score = (
        0.45 * embedding_score +
        0.30 * overlap_score +
        0.25 * related_score
    )
    final_score = final_score * domain_penalty
    final_score = max(0, min(final_score, 1))
    
    # STEP 5 — HARD RULE (CRITICAL)
    if not exact_match:
        final_score = min(final_score, 0.85)
    
    # STEP 4 — SAFETY CLAMP
    final_score = min(final_score, 0.99)
    if exact_match:
        final_score = min(final_score, 1.0)
    
    # STEP 7 — ROUNDING FIX
    final_score = round(final_score, 2)
    percentage = int(final_score * 100)
    
    # STEP 1 — DEBUG LOG
    print(f"[HYBRID] exact_match={exact_match}, embedding={embedding_score:.3f}, overlap={overlap_score:.3f}, related={related_score:.3f}, domain_pen={domain_penalty}, final_before_cap={final_score:.3f}, percentage={percentage}")
    
    return percentage, exact_match


def _get_profile_skills(profile):
    """Helper to extract normalized skill list from profile JSON/String."""
    if not profile or not hasattr(profile, 'skills') or not profile.skills:
        return []
    raw = profile.skills
    if isinstance(raw, list):
        return [s.strip().lower() for s in raw if s and s.strip()]
    if isinstance(raw, str):
        return [s.strip().lower() for s in raw.split(',') if s and s.strip()]
    return []

def calculate_match_score(job, profile):
    """
    Calculates a hybrid match score (0.0 to 1.0) for a specific user profile
    against a specific job using the upgraded scoring system with domain penalty.
    """
    if not job or not profile:
        return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "none"}

    # 1. PARSE CV IF AVAILABLE
    cv_skills = []
    cv_text = ""
    user_exp = getattr(profile, 'experience', 0)
    
    cv_file = getattr(profile, 'cv', None)
    if cv_file and hasattr(cv_file, 'path'):
        try:
            from services.cv_parser import parse_cv
            parsed = parse_cv(cv_file.path)
            cv_skills = parsed.get("skills", [])
            cv_text = parsed.get("raw_text", "")
            user_exp = parsed.get("experience", user_exp)
        except Exception as e:
            print(f"[RECO] Error parsing CV: {e}")

    # 2. PRIORITIZE CV SKILLS
    profile_skills = cv_skills if cv_skills else _get_profile_skills(profile)
    
    # Return 0 if user has no skills - STRICT RULE
    if not profile_skills or len(profile_skills) == 0 or (len(profile_skills) == 1 and not profile_skills[0]):
        print(f"[RECO] No skills found for user {profile.user.email}, returning 0% match.")
        return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}

    job_skills = job.required_skills or []

    # Normalize skills
    user_skills_norm = [s.strip().lower() for s in profile_skills if s and s.strip()]
    job_skills_norm = [s.strip().lower() for s in job_skills if s and s.strip()]
    
    # STEP 4 — HARD FILTER: STRICT MATCH CHECK
    # If no skill relation exists, return 0 immediately to prevent cross-domain matches
    if not _has_any_match(user_skills_norm, job_skills_norm):
        print(f"[RECO] NO SKILL RELATION: user_skills={user_skills_norm}, job_skills={job_skills_norm} -> returning 0")
        return {
            "job": job,
            "score": 0,
            "direct_matches": [],
            "related_matches": [],
            "skill_score": 0,
            "related_score": 0,
            "experience_score": 0,
            "reason": "no_relation",
            "exact_match": False,
            "embedding": 0,
            "overlap": 0,
            "related": 0,
            "source": "cv" if cv_skills else "profile"
        }
    
    intersection = set(user_skills_norm) & set(job_skills_norm)
    
    # Check for taxonomy matches before returning 0
    has_taxonomy_match = False
    for js in job_skills_norm:
        related = _TAXONOMY.get(js, set())
        if related & set(user_skills_norm):
            has_taxonomy_match = True
            break
    
    if len(intersection) == 0 and not has_taxonomy_match:
        # Strict known domain mismatch — return 0 immediately
        user_domain = _detect_domain(profile_skills)
        job_domain = _detect_domain(job_skills)
        
        # Check for specific job titles that require specific skills
        job_title_lower = job.title.lower() if job.title else ""
        user_skills_lower = [s.lower() for s in profile_skills]
        
        # Only apply strict checks for architect/engineering if not in tech domain
        if user_domain != 'tech' or job_domain != 'tech':
            if 'architect' in job_title_lower:
                architect_keywords = ['architecture', 'design', 'system design', 'technical design']
                has_architect_skills = any(kw in ' '.join(user_skills_lower) for kw in architect_keywords)
                if not has_architect_skills:
                    print(f"[RECO] Job requires architect skills which user doesn't have, returning 0")
                    return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}
            
            if 'engineering' in job_title_lower:
                engineering_keywords = ['engineering', 'engineer']
                has_engineering_skills = any(kw in ' '.join(user_skills_lower) for kw in engineering_keywords)
                if not has_engineering_skills:
                    print(f"[RECO] Job requires engineering skills which user doesn't have, returning 0")
                    return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}
        
        if user_domain != 'other' and job_domain != 'other' and user_domain != job_domain:
            print(f"[RECO] Known domain mismatch without skill overlap ({user_domain} vs {job_domain}), returning 0")
            return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}

        # No exact overlap — check semantic similarity job-skill by job-skill
        # For each job skill, find the max similarity with ANY user skill
        if not job_skills_norm or not user_skills_norm:
            return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}

        user_embs = model.encode(user_skills_norm)
        job_embs = model.encode(job_skills_norm)
        user_tensor_skills = torch.FloatTensor(user_embs)
        job_tensor_skills = torch.FloatTensor(job_embs)

        # For each job skill → best matching user skill → take overall max
        best_per_job_skill = []
        for j_emb in job_tensor_skills:
            sims = F.cosine_similarity(j_emb.unsqueeze(0), user_tensor_skills, dim=1)
            best_per_job_skill.append(float(torch.max(sims)))
        max_semantic = max(((s + 1) / 2 for s in best_per_job_skill), default=0)

        # STEP 4 — LOWER FILTER THRESHOLD
        # Use lower threshold to avoid filtering out related matches
        threshold = 0.3 if (user_domain == 'tech' and job_domain == 'tech') else 0.3
        if max_semantic < threshold:
            print(f"[RECO] No skill overlap and low semantic similarity (Max: {max_semantic:.2f}, threshold: {threshold}), returning 0")
            return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "cv" if cv_skills else "profile"}

    # ── Fully job-centric scoring ────────────────────────────────────────────
    # No global user vector is used. Every metric measures:
    # "how well does the user cover THIS job's required skills?"
    # This makes every job's score completely independent of every other job.

    # Domain penalty (only applied when domains are fully known and different)
    user_domain = _detect_domain(profile_skills)
    job_domain = _detect_domain(job_skills)
    domain_penalty = 0.5 if (user_domain != job_domain and user_domain != 'other' and job_domain != 'other') else 1.0

    try:
        skills_score = _skill_overlap_score(profile_skills, job_skills)
        embedding_score = _semantic_skill_match(profile_skills, job_skills)
        related_score_val, direct_matches, related_matches, exact_match = _related_score(profile_skills, job_skills)
        boosted_embedding_score, reason = _boost_related_skills(profile_skills, job_skills, embedding_score)

        # Experience component
        job_exp_map = {'ENTRY': 1, 'MID': 3, 'SENIOR': 5, 'EXECUTIVE': 10}
        job_exp_req = job_exp_map.get(job.experience_level, 2)
        exp_score_val = experience_score(user_exp, job_exp_req)

        # STEP 6 — FINAL SCORING: Only compute if relation exists (already enforced by hard filter above)
        final_score, exact_match = _hybrid_score(
            skill_overlap=skills_score,
            related_score=related_score_val,
            embedding_score=boosted_embedding_score,
            exp_score=exp_score_val,
            domain_penalty=domain_penalty,
            exact_match=exact_match
        )

        print(f"[RECO] Job '{job.title}': skill={int(skills_score*100)}%, related={int(related_score_val*100)}%, embed={int(boosted_embedding_score*100)}%, exp={int(exp_score_val*100)}%, domain_pen={domain_penalty}, exact_match={exact_match} -> final={final_score}%")
        if reason:
            print(f"[RECO] Boost reason: {reason}")

        return {
            "job": job,
            "score": final_score,
            "direct_matches": direct_matches,
            "related_matches": related_matches,
            "skill_score": int(skills_score * 100),
            "related_score": int(related_score_val * 100),
            "experience_score": int(exp_score_val * 100),
            "reason": reason if reason else "matched",
            "exact_match": exact_match,
            "embedding": int(boosted_embedding_score * 100),
            "overlap": int(skills_score * 100),
            "related": int(related_score_val * 100),
            "source": "cv" if cv_skills else "profile"
        }
    except Exception as e:
        import traceback
        print(f"[RECO] Matching failed for '{job.title}': {e}")
        traceback.print_exc()
        return {"job": job, "score": 0, "skill_score": 0, "experience_score": 0, "source": "error"}


def get_job_recommendations(profile, top_n=5):
    print("AI MATCHING STARTED")
    print(f"User profile ID: {profile.id if hasattr(profile, 'id') else 'N/A'}")
    
    jobs = list(Job.objects.filter(is_active=True))
    print(f"Jobs count: {len(jobs)}")
    
    if not jobs:
        print("No active jobs found")
        return []

    profile_skills = _get_profile_skills(profile)
    print(f"User skills: {profile_skills}")
    print(f"User skills length: {len(profile_skills)}")
    
    # Return 0 for all jobs if user has no skills
    if not profile_skills or len(profile_skills) == 0:
        print(f"[RECO] User has no skills, returning 0 for all jobs")
        job_scores = [{
            "job": job,
            "score": 0,
            "skill_score": 0,
            "experience_score": 0,
            "source": "profile"
        } for job in jobs]
        return job_scores[:top_n]

    # Detect user domain
    user_domain = _detect_domain(profile_skills)
    print(f"User domain: {user_domain}")

    job_scores = []
    for job in jobs:
        try:
            score_data = calculate_match_score(job, profile)
            job_scores.append(score_data)
        except Exception as e:
            print(f"[RECO] Error calculating score for job {job.id}: {e}")
            job_scores.append({
                "job": job,
                "score": 0,
                "skill_score": 0,
                "experience_score": 0,
                "source": "error"
            })

    job_scores.sort(key=lambda x: x['score'], reverse=True)
    
    # STEP 7 — FINAL RECOMMENDATION FILTER: Only include jobs with score >= 0.3
    filtered_scores = [js for js in job_scores if js['score'] >= 0.3]
    print(f"[RECO] Filtered from {len(job_scores)} to {len(filtered_scores)} jobs (score >= 0.3)")
    
    print("Top matches:")
    for i, res in enumerate(filtered_scores[:3], 1):
        print(f"  {i}. {res['job'].title} - Score: {res['score']}%")
    
    return filtered_scores[:top_n]
