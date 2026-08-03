$rootDir = "c:\Users\hp\Downloads\SKILL-BASED-EMP"

$dirs = @(
    "frontend/public",
    "frontend/src/assets",
    "frontend/src/components/common",
    "frontend/src/components/layout",
    "frontend/src/pages",
    "frontend/src/services",
    "frontend/src/store",
    "frontend/src/context",
    "frontend/src/hooks",
    "frontend/src/utils",
    "frontend/src/styles",
    
    "backend/core/settings",
    "backend/apps/users/api",
    "backend/apps/jobs/api",
    "backend/apps/applications/api",
    "backend/apps/ai_matching/api",
    "backend/tests",
    
    "ai_service/app/api",
    "ai_service/app/models",
    "ai_service/app/pipelines",
    "ai_service/app/utils",
    "ai_service/app/services",
    "ai_service/data/raw",
    "ai_service/data/processed",
    "ai_service/notebooks"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path "$rootDir\$dir" | Out-Null
}

$files = @(
    "docker-compose.yml",
    ".gitignore",
    
    "frontend/Dockerfile",
    "frontend/package.json",
    "frontend/vite.config.js",
    "frontend/index.html",
    "frontend/src/App.jsx",
    "frontend/src/main.jsx",
    "frontend/src/index.css",
    
    "backend/Dockerfile",
    "backend/requirements.txt",
    "backend/manage.py",
    "backend/core/__init__.py",
    "backend/core/urls.py",
    "backend/core/wsgi.py",
    "backend/core/asgi.py",
    "backend/core/settings/__init__.py",
    "backend/core/settings/base.py",
    "backend/core/settings/development.py",
    "backend/core/settings/production.py",
    "backend/apps/__init__.py",
    "backend/apps/users/__init__.py",
    "backend/apps/users/models.py",
    "backend/apps/jobs/__init__.py",
    "backend/apps/jobs/models.py",
    "backend/apps/applications/__init__.py",
    "backend/apps/applications/models.py",
    "backend/apps/ai_matching/__init__.py",
    
    "ai_service/Dockerfile",
    "ai_service/requirements.txt",
    "ai_service/app/__init__.py",
    "ai_service/app/main.py",
    "ai_service/app/pipelines/__init__.py",
    "ai_service/app/pipelines/train.py",
    "ai_service/app/pipelines/predict.py",
    "ai_service/app/services/__init__.py",
    "ai_service/app/services/matching_service.py"
)

foreach ($file in $files) {
    $path = "$rootDir\$file"
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Force -Path $path | Out-Null
    }
}
