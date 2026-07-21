# College Management Portal

Local React + FastAPI college portal with JWT authentication, seeded users, a public landing site, dashboard statistics, and management screens.

## Run

Backend:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
``` 

Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@campus.edu` | `Admin@123` |
| Faculty (primary) | `faculty@campus.edu` | `Faculty@123` |
| Faculty 1–15 | `faculty1@campus.edu` … `faculty15@campus.edu` | `Faculty1@123` … `Faculty15@123` |
| Student (primary) | `student@campus.edu` | `Student@123` |
| Student 1–10 | `student1@campus.edu` … `student10@campus.edu` | `Student1@123` … `Student10@123` |

Only the Admin account can add, edit or delete students, faculty, departments, courses, subjects, companies and other core records. Students can submit leave; only Admin can approve it. Faculty can mark attendance for their assigned students.

By default the project uses SQLite for no-friction local setup. Set `DATABASE_URL` to a PostgreSQL connection string before startup to use PostgreSQL.
