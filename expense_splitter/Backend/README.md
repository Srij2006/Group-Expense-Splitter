# Django backend for the expense-sharing React app

This backend uses:
- Django 5.2
- SQLite
- Django session authentication (`sessionid` cookie)
- CORS for the separate React frontend
- Gunicorn for production

## API

- `POST /signup` body `{ "username": "arijit", "password": "secret123" }`
- `POST /login` body `{ "username": "arijit", "password": "secret123" }`
- `POST /logout`
- `GET /me`
- `GET /api/dashboard`
- `GET /api/groups`
- `POST /api/groups` body `{ "name": "Goa Trip", "members": ["akash", "rahul"] }`
- `GET /api/expenses`
- `GET /api/csrf`

## Important balance rule

Because your API specification does not include per-expense shares, every expense is split equally across all members of the group.

For a group:
`current user's balance = amount they paid - (all group expenses / number of members)`

Positive = the group owes the user.
Negative = the user owes the group.

## Local setup

### Windows PowerShell

```powershell
cd django_backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: `http://127.0.0.1:8000/`
Admin: `http://127.0.0.1:8000/admin/`

### React Axios

Your Axios instance should use:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
```

For production, set the frontend environment variable to your Render API URL, e.g.
`VITE_API_BASE_URL=https://your-api-name.onrender.com`

For local development:
`VITE_API_BASE_URL=http://127.0.0.1:8000`

## Render deployment with SQLite

Render services have an ephemeral filesystem by default. The included `render.yaml` attaches a 1 GB persistent disk and puts the SQLite database at `/var/data/db.sqlite3`.

The persistent-disk approach requires a paid Render web service. Also keep the service at one instance because SQLite + a single local disk is not a multi-instance database setup.

### Option A: Blueprint deployment (recommended)

1. Push this backend folder to GitHub.
2. In Render, create a new Blueprint and select the repository.
3. Render reads `render.yaml`.
4. Set these environment variables in the Render dashboard:
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app`
5. Deploy.
6. Open your Render URL and test `/`.
7. Create an admin user from Render Shell:
   `python manage.py createsuperuser`

### Option B: manual deployment

Use:
- Runtime: Python
- Build command: `./build.sh`
- Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1`

Then add the same environment variables above and attach a persistent disk mounted at `/var/data`.

Do not use multiple instances with this SQLite configuration.

## If you use Render Free

You can deploy without a persistent disk for a temporary/demo deployment, but the SQLite file is not durable and can be lost after a restart/redeploy. Render documents persistent disks as the option for preserving filesystem data, and recommends managed Postgres for relational production workloads.
