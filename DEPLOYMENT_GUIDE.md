# 🚀 Group Expense Splitter - Deployment Guide

## Project Structure
```
Group-Expense-Splitter/
├── expense_splitter/
│   ├── Backend/          (Django REST API)
│   └── Frontend/         (React + Vite)
├── requirements.txt      (Python dependencies)
├── Dockerfile            (Container image)
├── docker-compose.yml    (Local dev environment)
├── Procfile              (Heroku/Railway)
└── render.yaml           (Render.com config)
```

---

## ✅ Step 1: Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

### Backend Setup
```bash
cd expense_splitter/Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### Frontend Setup
```bash
cd expense_splitter/Frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🐳 Step 2: Docker Local Deployment

### Build and Run
```bash
docker-compose up --build
```

This will:
- Build the Docker image
- Install all dependencies
- Build React frontend
- Run Django server at `http://localhost:8000`

### Stop Container
```bash
docker-compose down
```

---

## 🌐 Step 3: Deploy to Render.com (Recommended - FREE)

### 3.1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3.2: Deploy
1. Click **"New +"** → **"Web Service"**
2. Select **Srij2006/Group-Expense-Splitter**
3. Fill in details:
   - **Name**: `group-expense-splitter`
   - **Environment**: `Python 3.11`
   - **Build Command**: 
     ```bash
     pip install -r expense_splitter/Backend/requirements.txt && cd expense_splitter/Frontend && npm install && npm run build && cd ../../
     ```
   - **Start Command**: 
     ```bash
     cd expense_splitter/Backend && gunicorn expense_splitter.wsgi:application --bind 0.0.0.0:$PORT
     ```

### 3.3: Environment Variables
In Render dashboard, set:
```
SECRET_KEY = generate-a-random-key-here
DEBUG = False
ALLOWED_HOSTS = your-app-name.onrender.com,localhost
CORS_ALLOWED_ORIGINS = https://your-app-name.onrender.com
```

### 3.4: Deploy
Click **"Create Web Service"** and wait for deployment!

✅ Your app will be live at: `https://group-expense-splitter.onrender.com`

---

## 🚀 Step 4: Deploy to Heroku

### 4.1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### 4.2: Login & Create App
```bash
heroku login
heroku create group-expense-splitter
```

### 4.3: Set Environment Variables
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS="group-expense-splitter.herokuapp.com"
```

### 4.4: Deploy
```bash
git push heroku main
```

✅ App at: `https://group-expense-splitter.herokuapp.com`

---

## 🚀 Step 5: Deploy to Railway.app

### 5.1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 5.2: Deploy
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select **Srij2006/Group-Expense-Splitter**
3. Set environment variables (same as Render)
4. Click **"Deploy"**

---

## 🔐 Production Checklist

- [ ] Change `SECRET_KEY` to a random secure value
- [ ] Set `DEBUG = False`
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Set up `CORS_ALLOWED_ORIGINS`
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Test all API endpoints
- [ ] Test frontend build and deployment

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-random-key` |
| `DEBUG` | Debug mode (FALSE for production) | `False` |
| `ALLOWED_HOSTS` | Allowed domains | `app.com,www.app.com` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `https://app.com` |
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host/db` |

---

## 🐛 Troubleshooting

### Frontend not loading
- Ensure `npm run build` completes successfully
- Check CORS settings in Django
- Verify STATIC_ROOT path in settings.py

### API endpoints returning 404
- Verify Django migrations: `python manage.py migrate`
- Check ALLOWED_HOSTS configuration
- Ensure Backend is running on correct port

### Database issues
- Ensure db.sqlite3 has correct permissions
- For production, migrate to PostgreSQL
- Run: `python manage.py migrate`

### CORS errors
- Add frontend URL to CORS_ALLOWED_ORIGINS
- Include trailing slash in CORS settings
- Clear browser cache and try again

---

## 📞 Need Help?

- Django Docs: https://docs.djangoproject.com/
- React Docs: https://react.dev/
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app/

---

## 🎉 Deployment Complete!

Your app is now live! 

**Next Steps:**
1. Test all features in production
2. Set up monitoring and logging
3. Configure backups for production database
4. Share your app with users!

