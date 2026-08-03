import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_NAME = os.getenv('MODEL_NAME', 'all-MiniLM-L6-v2')
CACHE_DIR = os.getenv('CACHE_DIR', str(BASE_DIR / 'data' / 'cache'))
DATA_DIR = os.getenv('DATA_DIR', str(BASE_DIR / 'data'))

SIMILARITY_THRESHOLD = 0.6
SKILL_EXPANSION_THRESHOLD = 0.6
TOP_K_RECOMMENDATIONS = 10
MIN_SCORE_THRESHOLD = 50.0

SCORE_WEIGHTS = {
    'embedding': 0.6,
    'skill_overlap': 0.25,
    'semantic_skill': 0.15
}

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
