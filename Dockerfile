FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY expense_splitter/Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Build frontend
COPY expense_splitter/Frontend/ frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy backend
WORKDIR /app
COPY expense_splitter/Backend/ backend/

# Collect static files
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Start server
CMD ["gunicorn", "expense_splitter.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]