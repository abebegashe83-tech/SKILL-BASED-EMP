import fitz  # PyMuPDF
import re

SKILLS_DB = [
    "python", "django", "react", "nodejs",
    "javascript", "typescript", "sql",
    "machine learning", "data analysis",
    "java", "c++", "c#", "ruby", "php",
    "go", "rust", "aws", "docker", "kubernetes",
    "fastapi", "flask", "spring boot", "html", "css",
    "angular", "vue", "nextjs", "next.js", "graphql"
]

def extract_text_from_pdf(file_path):
    """Extracts raw text from a PDF file."""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def clean_text(text):
    """Cleans extracted text by removing extra spaces and special characters."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\+\#\.]', ' ', text)  # Keep +, #, . for c++, c#, next.js
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_skills(text):
    """Finds known skills in the cleaned text."""
    found = []
    # Adding spaces around skill to ensure exact word matches for short words like 'c' or 'go'
    # But since clean_text removes punctuation, we just check inclusion.
    for skill in SKILLS_DB:
        # Simple word boundary check
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found.append(skill)
    return list(set(found))

def extract_experience(text):
    """Extracts total years of experience using regex."""
    # Matches patterns like '5+ years', '3 yrs', '10 years'
    pattern = r'(\d+)\+?\s*(?:years|yrs|year|yr)\b'
    matches = re.findall(pattern, text)
    if matches:
        # Return the maximum years found as an integer
        years = [int(y) for y in matches]
        return max(years)
    return 0

def extract_education(text):
    """Extracts general education keywords."""
    keywords = ["bachelor", "master", "phd", "degree", "university", "college", "diploma", "bsc", "msc", "ba", "ma"]
    found = []
    for kw in keywords:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, text):
            found.append(kw)
    return list(set(found))

def parse_cv(file_path):
    """Main function to parse CV and extract structured data."""
    raw_text = extract_text_from_pdf(file_path)
    cleaned_text = clean_text(raw_text)

    return {
        "raw_text": cleaned_text,
        "skills": extract_skills(cleaned_text),
        "experience": extract_experience(cleaned_text),
        "education": extract_education(cleaned_text)
    }
