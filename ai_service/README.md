# AI Service - Employment Platform

We process complex ML logic (such as scoring candidates against job descriptions) asynchronously via this separate **Python Service**, powered by **Scikit-learn**.

## Overview 
By abstracting complex models outside of the standard Django request/response lifecycle, we eliminate bottlenecks and enable independent ML scaling over distributed orchestrators.

- **`app/pipelines/`**: Contains modular pipelines (`train.py`, `predict.py`) for standardized data transformation sequences.
- **`app/api/`**: Interfacing API routes bridging the Django backend or Frontend direct-calls (using FastAPI/Flask standard interfaces).
- **`app/models/`**: Versioned persistence path for encoded models (.pkl, .joblib).
- **`data/`**: Scoped `raw/` and `processed/` data volumes for localized iteration, typically mounted to cloud buckets in production.
- **`notebooks/`**: Interactive Jupyter notebooks to facilitate EDA (Exploratory Data Analysis) prior to committing pipeline implementations.
