"""
Django settings for PropOS AI.
"""

from pathlib import Path
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# 🔧 FIX #8: SECRET_KEY from environment variable
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY', 
    'django-insecure-dev-only-change-me-in-production'
)

# 🔧 FIX #9: Use env var for DEBUG (defaults to True for dev)
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders',

    # PropOS Modules (The 5 Pillars)
    'core',            # SaaS & Users
    'properties',      # Buildings & Units
    'tenants',         # People & Contracts
    'finance',         # Money & Cheques
    'communication',   # AI & Support
    'maintenance',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'propos_db'),
        'USER': os.environ.get('POSTGRES_USER', 'propos_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'propos_password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': '5432',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dubai'  # 🔧 Changed to Dubai timezone
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'core.User'

# 🔧 FIX #9: CORS — Whitelist specific origins instead of allowing all
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Fallback: Allow all in DEBUG mode only
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True


# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}


# Media Files (User Uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Email Settings (Development Mode)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST_USER = 'system@propos.ai'

# 🔧 FIX #14: Celery Configuration
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'