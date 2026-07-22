import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "development-only")
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [
    value.strip()
    for value in os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
    if value.strip()
]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "migration_api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    }
]
WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_ADMIN_DB", "postgres"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "HOST": os.getenv("POSTGRES_HOST", "127.0.0.1"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

LANGUAGE_CODE = "it-it"
TIME_ZONE = "Europe/Rome"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
