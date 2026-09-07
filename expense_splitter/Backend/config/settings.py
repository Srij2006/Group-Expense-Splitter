import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


# --------------------------------------------------
# Basic settings
# --------------------------------------------------

DEBUG = os.getenv(
    'DEBUG',
    'True'
).lower() in ('1', 'true', 'yes', 'on')

SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'dev-only-secret-key-change-me'
)


ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        'ALLOWED_HOSTS',
        '127.0.0.1,localhost'
    ).split(',')
    if host.strip()
]

if '*' not in ALLOWED_HOSTS:
    render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')

    if render_hostname and render_hostname not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(render_hostname)


# --------------------------------------------------
# Applications
# --------------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',

    'api',
]


# --------------------------------------------------
# Middleware
# --------------------------------------------------

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',

    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',

    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# --------------------------------------------------
# URLs / Templates
# --------------------------------------------------

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
ASGI_APPLICATION = 'config.asgi.application'


# --------------------------------------------------
# Database
# --------------------------------------------------

sqlite_path = os.getenv('SQLITE_PATH', '').strip()

if sqlite_path:
    DB_PATH = Path(sqlite_path)

    # Relative paths such as data/db.sqlite3 are relative
    # to the Django project root.
    if not DB_PATH.is_absolute():
        DB_PATH = BASE_DIR / DB_PATH
else:
    DB_PATH = BASE_DIR / 'data' / 'db.sqlite3'

DB_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': DB_PATH,
        'OPTIONS': {
            'timeout': 20,
        },
    }
}


# --------------------------------------------------
# Password validation
# --------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME':
            'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },
    {
        'NAME':
            'django.contrib.auth.password_validation.MinimumLengthValidator'
    },
    {
        'NAME':
            'django.contrib.auth.password_validation.CommonPasswordValidator'
    },
    {
        'NAME':
            'django.contrib.auth.password_validation.NumericPasswordValidator'
    },
]


# --------------------------------------------------
# Internationalization
# --------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'

USE_I18N = True
USE_TZ = True


# --------------------------------------------------
# Static files
# --------------------------------------------------

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_STORAGE = (
    'whitenoise.storage.CompressedManifestStaticFilesStorage'
)


# --------------------------------------------------
# Django defaults
# --------------------------------------------------

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --------------------------------------------------
# CORS / CSRF
# --------------------------------------------------

frontend_url = os.getenv(
    'FRONTEND_URL',
    'http://localhost:5173'
).strip().rstrip('/')


CORS_ALLOWED_ORIGINS = [
    url.strip().rstrip('/')
    for url in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        frontend_url
    ).split(',')
    if url.strip()
]


CORS_ALLOW_CREDENTIALS = True


CSRF_TRUSTED_ORIGINS = [
    url.strip().rstrip('/')
    for url in os.getenv(
        'CSRF_TRUSTED_ORIGINS',
        frontend_url
    ).split(',')
    if url.strip()
]


# --------------------------------------------------
# Cookies / HTTPS
# --------------------------------------------------

if DEBUG:

    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'

else:

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'

    SECURE_PROXY_SSL_HEADER = (
        'HTTP_X_FORWARDED_PROTO',
        'https'
    )

    SECURE_SSL_REDIRECT = True

    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True


SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False