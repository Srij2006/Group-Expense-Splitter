# Group Expense Splitter

A full-stack web application for managing shared group expenses, tracking balances, and viewing spending history.

## Live Website

**https://group-expense-splitter-ashy.vercel.app/**

## Features

- User signup and login
- Django session-based authentication
- Create expense-sharing groups
- Add existing users to groups by username
- View groups the logged-in user belongs to
- View group totals and balances
- Add expenses to a group
- View all expenses across the user's groups
- Search expenses
- Filter expenses by group
- Dashboard statistics
- Expense history chart
- Responsive React interface

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Motion
- Recharts
- React Icons

### Backend

- Django
- Django authentication and sessions
- Django CORS Headers
- WhiteNoise
- Gunicorn

### Database

- SQLite

## Project Structure

```text
GROUP_EXPENSE_SPLITTER/
└── expense_splitter/
    ├── Backend/
    │   ├── api/
    │   ├── config/
    │   ├── data/
    │   │   └── db.sqlite3
    │   ├── manage.py
    │   ├── requirements.txt
    │   ├── build.sh
    │   └── render.yaml
    │
    └── Frontend/
        ├── src/
        ├── public/
        ├── package.json
        ├── vite.config.js
        └── vercel.json
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Backend health check |
| `POST` | `/signup` | Create a new account |
| `POST` | `/login` | Log in |
| `POST` | `/logout` | Log out |
| `GET` | `/me` | Get the current logged-in user |
| `GET` | `/api/csrf` | Get a CSRF token |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Dashboard statistics and chart data |

### Groups

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/groups` | Get groups for the logged-in user |
| `POST` | `/api/groups` | Create a new group |

Example request:

```json
{
  "name": "Goa Trip",
  "members": [
    "akash",
    "rahul"
  ]
}
```

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Get expenses visible to the logged-in user |
| `POST` | `/api/expenses` | Create an expense |

Example request:

```json
{
  "description": "Dinner",
  "amount": 1200,
  "groupId": 1
}
```

The logged-in user is automatically recorded as the person who paid the expense.

## Expense Calculation

The current backend uses an equal-split model.

For example, if a group has 4 members and an expense of ₹1200 is added:

```text
₹1200 / 4 = ₹300 per person
```

If you paid the full ₹1200:

```text
₹1200 - ₹300 = +₹900
```

A positive balance means you are owed money.

A negative balance means you owe money.

## Running the Backend Locally

Navigate to the backend folder:

```bash
cd Backend
```

Create a virtual environment.

### Windows

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000
```

## Running the Frontend Locally

Navigate to the frontend:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Environment Variables

### Backend

For local development:

```env
DEBUG=True
SQLITE_PATH=data/db.sqlite3
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

For deployment, set the corresponding values in Render. The production frontend origin should be the Vercel URL.

### Frontend

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

## Deployment

### Backend on Render

The backend is configured for Render with:

```bash
bash build.sh
```

and:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1
```

### Frontend on Vercel

The frontend is configured for Vercel.

The project includes a `vercel.json` SPA rewrite so React Router routes such as `/dashboard`, `/groups`, and `/expenses` continue to work after a page refresh.

## SQLite Deployment Note

The current deployment uses SQLite on a Render Free web service.

Render Free services use an ephemeral filesystem, so SQLite data may be lost after a restart, redeploy, or service spin-down.

This setup is suitable for:

- College projects
- Portfolio demonstrations
- Temporary testing
- Demo deployments

For persistent production data, use a persistent disk with a paid service or move the database to PostgreSQL.

## Authentication

The application uses Django's built-in session authentication.

The frontend Axios client uses:

```javascript
withCredentials: true
```

so the browser can send the Django session cookie with API requests.

CSRF handling is used for protected state-changing requests.

## Development Flow

```text
Start Django
     ↓
Start React
     ↓
Sign up / Log in
     ↓
Create a group
     ↓
Add an expense
     ↓
View dashboard, groups, and expenses
```

## Notes

- Users must already exist before they can be added to a group.
- A user can only create expenses in groups they belong to.
- Group balances are calculated from recorded expenses.
- The current expense-splitting logic assumes equal shares among group members.
- The backend and frontend are deployed separately.

## Live Demo

**https://group-expense-splitter-ashy.vercel.app/**
