# Backend - Employment Platform

The backend leverages **Django**, **Django REST Framework (DRF)**, and **PostgreSQL** under the hood.

## Folder Structure
We enforce a scalable multi-app structure:

- **`core/`**: Central Django project orchestrator handling settings, WSGI/ASGI configurations, and base routing.
- **`apps/users/`**: Manages custom User models, JWT-based Authentication, and profiles.
- **`apps/jobs/`**: Core app scaling job creation, employer postings, and categorizations.
- **`apps/applications/`**: Business logic behind applicants, lifecycle events, and application states.
- **`apps/ai_matching/`**: App acting as an abstraction layer to asynchronously push/pull job and candidate data to the external Python AI Service.

## Environment Variables
Copy `.env.example` to `.env` to load backend credentials securely.
