import sys
import os

# Add backend to path to import service
sys.path.append(os.path.join(os.getcwd(), "backend"))

from services.embedding_service import preprocess_text

test_strings = [
    "JS, ReactJS, Node.js",
    "Python, Django, SQL",
    "TS, Next.js, docker",
    "Software Engineer, Senior",
]

print("--- Preprocessing Verification ---")
for s in test_strings:
    print(f"Original: {s}")
    print(f"Cleaned:  {preprocess_text(s)}")
    print("-" * 30)
