# Skill-Based Employment Platform

An AI-powered job marketplace that connects jobseekers with employers through intelligent skill-based matching. The platform uses semantic embeddings, a taxonomy-driven skill graph, and a hybrid scoring pipeline to surface the most relevant job opportunities for each candidate.

---

## Table of Contents

- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [AI Matching Engine](#ai-matching-engine)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Tech Stack](#tech-stack)
- [Design Decisions](#design-decisions)

---

## Architecture

The platform is composed of three independently deployable services:

```
next-frontend/   →  Next.js 14 + Tailwind CSS + Axios          (port 3000)
backend/         →  Django + DRF + PostgreSQL + JWT             (port 8000)
ai_service/      →  FastAPI + SentenceTransformers (MiniLM)     (port 8001)
```

The Django backend integrates the AI matching logic in-process via `services/recommendation_service.py`. The FastAPI service exposes the same logic as a standalone HTTP endpoint, available for decoupled or external consumption.

---

## User Roles

| Role          | Capabilities                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Jobseeker** | Build a skill profile, upload a CV, receive AI-powered job recommendations, apply to positions, and track application status       |
| **Employer**  | Post job listings with required skills, manage applicants, advance candidates through the hiring pipeline, and schedule interviews |
| **Admin**     | Full platform management through the Django admin panel                                                                            |

---

## Project Structure

```
SKILL-BASED-EMP/
├── next-frontend/
│   ├── app/
│   │   ├── page.jsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── jobseeker/
│   │   │   │   ├── dashboard/
│   │   │   │   └── profile/
│   │   │   ├── employer/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── post-job/
│   │   │   │   └── profile/
│   │   │   ├── admin/
│   │   │   │   └── dashboard/
│   │   │   └── notifications/
│   │   ├── jobs/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── forgot-password/
│   │   └── reset-password-otp/
│   ├── components/
│   │   ├── CVUpload.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── common/
│   │   ├── guards/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.js
│   │   └── auth.js
│   └── middleware.js
│
├── backend/
│   ├── core/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── users/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── ai_matching/
│   │   ├── notifications/
│   │   ├── admin_api/
│   │   └── contact/
│   └── services/
│       ├── recommendation_service.py
│       ├── embedding_service.py
│       ├── cv_parser.py
│       └── skill_normalizer.py
│
└── ai_service/
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   └── services/
    │       ├── embedding_service.py
    │       ├── matching_service.py
    │       └── skill_normalizer.py
    ├── models/
    │   └── schemas.py
    ├── pipelines/
    │   ├── train.py
    │   └── predict.py
    ├── data/
    │   └── cache/
    │       └── skill_embeddings.pkl
    └── requirements.txt
```

---

## Data Models

### Users

| Model              | Description                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `User`             | Custom `AbstractBaseUser` with email-based authentication and role assignment (`jobseeker`, `employer`, `admin`) |
| `Profile`          | Unified profile storing skills (JSONField), bio, experience, education, and resume                               |
| `JobseekerProfile` | Extended jobseeker profile with CV upload (PDF, max 5 MB), profile picture, title, and location                  |
| `EmployerProfile`  | Company profile with name, industry, size, and profile picture                                                   |
| `PasswordResetOTP` | 6-digit OTP with a 10-minute expiry window, automatically invalidated after use                                  |

### Jobs

| Model | Description                                                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Job` | Job posting with title, description, `required_skills` (JSONField), salary, location, experience level (`ENTRY`, `MID`, `SENIOR`, `EXECUTIVE`), position count, and status (`open`, `filled`, `closed`) |

### Applications

| Model         | Description                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Application` | Links a user to a job with a unique constraint per pair. Tracks status through the pipeline: `pending → shortlisted → interview → accepted / rejected`. Includes interview scheduling fields (date, time, link, notes) and an optional CV attachment |

### Notifications

Automatically generated on every application lifecycle event: new application, status change, acceptance, and rejection.

---

## API Reference

Base URL: `http://localhost:8000/api/`

### Authentication & Users

| Method    | Endpoint                  | Description                                  | Auth     |
| --------- | ------------------------- | -------------------------------------------- | -------- |
| POST      | `auth/register/`          | Register a new user account                  | Public   |
| POST      | `auth/login/`             | Authenticate and receive a JWT access token  | Public   |
| GET       | `auth/user/`              | Retrieve the currently authenticated user    | Required |
| POST      | `auth/generate-otp/`      | Request a password reset OTP via email       | Public   |
| POST      | `auth/verify-otp-reset/`  | Verify OTP and set a new password            | Public   |
| GET / PUT | `profile/`                | Retrieve or update the user profile          | Required |
| GET       | `profile/new/`            | Extended profile view                        | Required |
| GET       | `profile/skill-insights/` | Market demand analysis for the user's skills | Required |
| POST      | `upload-cv/`              | Upload a PDF CV (max 5 MB)                   | Required |

### Jobs

| Method      | Endpoint                | Description                                         | Auth             |
| ----------- | ----------------------- | --------------------------------------------------- | ---------------- |
| GET         | `jobs/`                 | List all active job postings                        | Public           |
| POST        | `jobs/`                 | Create a new job posting                            | Employer         |
| GET         | `jobs/{id}/`            | Retrieve job details                                | Public           |
| PUT / PATCH | `jobs/{id}/`            | Update a job posting                                | Employer (owner) |
| DELETE      | `jobs/{id}/`            | Delete a job posting                                | Employer (owner) |
| GET         | `jobs/employer/jobs/`   | List all jobs created by the authenticated employer | Employer         |
| GET         | `jobs/{id}/applicants/` | List all applicants for a specific job              | Employer         |

### Applications

| Method | Endpoint                            | Description                                        | Auth      |
| ------ | ----------------------------------- | -------------------------------------------------- | --------- |
| POST   | `applications/apply/{job_id}/`      | Submit an application for a job                    | Jobseeker |
| GET    | `applications/my-applications/`     | Retrieve the jobseeker's application history       | Jobseeker |
| GET    | `applications/employer/candidates/` | List all applicants across the employer's jobs     | Employer  |
| PATCH  | `applications/{id}/status/`         | Update the status of an application                | Employer  |
| POST   | `applications/{id}/accept/`         | Accept a candidate and auto-fill the position slot | Employer  |
| POST   | `applications/jobs/{id}/close/`     | Close a job posting                                | Employer  |

### AI Matching

| Method | Endpoint                                | Description                                                               | Auth      |
| ------ | --------------------------------------- | ------------------------------------------------------------------------- | --------- |
| GET    | `ai-matching/recommendations/`          | Retrieve AI-generated job recommendations for the authenticated jobseeker | Jobseeker |
| GET    | `ai-matching/rank-candidates/{job_id}/` | Rank all applicants for a job by match score                              | Employer  |

### Notifications

| Method | Endpoint                   | Description                                 | Auth     |
| ------ | -------------------------- | ------------------------------------------- | -------- |
| GET    | `notifications/`           | List all notifications for the current user | Required |
| POST   | `notifications/{id}/read/` | Mark a notification as read                 | Required |

### Contact & CMS

| Method | Endpoint                   | Description                               | Auth   |
| ------ | -------------------------- | ----------------------------------------- | ------ |
| POST   | `contact/`                 | Submit a contact form message             | Public |
| GET    | `contact/landing-content/` | Retrieve CMS content for the landing page | Public |

### AI Service (Standalone)

| Method | Endpoint                                | Description                                              |
| ------ | --------------------------------------- | -------------------------------------------------------- |
| POST   | `http://localhost:8001/recommendations` | Request job recommendations directly from the ML service |
| GET    | `http://localhost:8001/api/v1/health`   | Service health check                                     |

---

## AI Matching Engine

The matching engine is implemented in `backend/services/recommendation_service.py` and uses the `all-MiniLM-L6-v2` model from SentenceTransformers to produce 384-dimensional semantic embeddings.

### Scoring Formula

For every active job, three independent components are computed and combined:

```
Final Score = 45% × Embedding Score
            + 30% × Skill Overlap Score
            + 25% × Related Score
```

**Embedding Score (45%)**
Cosine similarity between weighted text representations of the user profile and the job description. Skills are repeated three times in the input text to amplify their semantic weight relative to free-text content.

**Skill Overlap Score (30%)**
A job-centric, taxonomy-aware coverage metric. For each required job skill:

- Exact match with a user skill scores `1.0`
- A taxonomy-related match scores `0.6`

The denominator is always the number of job skills, ensuring that a user with a broader skill set never disadvantages a job with fewer requirements.

**Related Score (25%)**
A multi-hop lookup through a hand-crafted `SKILL_MAP` spanning technology, healthcare, business, and engineering domains:

- Exact match: `1.0`
- Direct relation (e.g. `python → django`): `0.7`
- Two-hop relation (e.g. `express → node.js → javascript`): `0.7`

### Scoring Guards and Caps

| Condition                                                  | Behavior                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| No skill relation detected between user and job            | Hard return of `0%` to prevent cross-domain noise                       |
| Cross-domain match (e.g. Django skills vs. a nursing role) | Score multiplied by a `0.5` domain penalty                              |
| No exact skill match present                               | Score capped at `85%`                                                   |
| All scores                                                 | Clamped to the range `0–99%`; `100%` is only possible on an exact match |
| Final recommendation filter                                | Only jobs scoring `≥ 30` are included in results                        |

### Skill Normalization

Aliases are resolved to canonical forms before any comparison is performed:

| Alias      | Canonical Form          |
| ---------- | ----------------------- |
| `js`       | `javascript`            |
| `ts`       | `typescript`            |
| `k8s`      | `kubernetes`            |
| `reactjs`  | `react`                 |
| `nextjs`   | `next.js`               |
| `postgres` | `postgresql`            |
| `mongo`    | `mongodb`               |
| `nodejs`   | `node.js`               |
| `drf`      | `django rest framework` |

### CV-First Skill Extraction

When a jobseeker has uploaded a CV, it is parsed by `cv_parser.py` and the extracted skills take precedence over manually entered profile skills for all matching calculations.

### Candidate Ranking

Employers can retrieve a ranked list of all applicants for a given job via `GET /api/ai-matching/rank-candidates/{job_id}/`. Each candidate is scored using the same hybrid pipeline, providing a data-driven shortlist.

---

## Authentication

The platform uses JSON Web Tokens issued by `djangorestframework-simplejwt`.

| Property               | Value                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| Access token lifetime  | 24 hours                                                                   |
| Refresh token lifetime | 7 days (rotation enabled)                                                  |
| Token storage          | `localStorage` and an HTTP cookie (7-day expiry)                           |
| Request authentication | `Authorization: Bearer <token>` header, attached by an Axios interceptor   |
| Token expiry handling  | `401` response clears all auth data automatically                          |
| Role mismatch handling | `403` on a dashboard route forces a redirect to `/login`                   |
| Route protection       | `middleware.js` validates the `authToken` cookie on every non-public route |

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher

### 1. Backend

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2. AI Service

```bash
cd ai_service

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### 3. Frontend

```bash
cd next-frontend

npm install

cp .env.example .env.local

npm run dev
```

---

## Environment Variables

### `backend/.env`

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/employment_db
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### `next-frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/
```

---

## Tech Stack

| Layer    | Technology                                                           |
| -------- | -------------------------------------------------------------------- |
| Frontend | Next.js 14.2.5, React 18.2, Tailwind CSS 3.4, Axios 1.15             |
| Backend  | Django 4, Django REST Framework, SimpleJWT                           |
| Database | PostgreSQL                                                           |
| AI / ML  | SentenceTransformers 2.2.2 (`all-MiniLM-L6-v2`), PyTorch, NumPy 1.24 |
| AI API   | FastAPI 0.104, Uvicorn 0.24                                          |
| Admin UI | Jazzmin                                                              |
| Auth     | JWT (access 24h / refresh 7d) + OTP-based email password reset       |

---

## Design Decisions

**Job-centric scoring**
Every scoring metric is normalized against the job's own skill count. This ensures that each job's score is fully independent — a user with a broader skill set does not unfairly disadvantage jobs with fewer requirements.

**Strict domain isolation**
Skills are classified into domains (technology, healthcare, business, engineering). Cross-domain matches are hard-blocked at the filter stage, preventing semantically unrelated results such as a software developer profile matching a clinical nursing role.

**CV-first matching**
Skills extracted from an uploaded CV take precedence over manually entered profile skills. This produces more accurate match scores for candidates who maintain an up-to-date CV.

**In-process ML inference**
The Django backend imports the SentenceTransformer model directly rather than routing requests through the FastAPI service. This eliminates HTTP overhead during development and keeps the recommendation latency low.

**Automatic position management**
When an employer accepts a candidate, `filled_positions` is incremented automatically. Once all positions are filled, the job status transitions to `filled` and any remaining `pending` applicants are rejected with a notification.

**Event-driven notifications**
Every transition in the application lifecycle — submission, shortlisting, interview scheduling, acceptance, and rejection — triggers a notification to the relevant party in real time.
