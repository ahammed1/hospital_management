# MediCore — Hospital Management System

A full-stack MERN starter for a final-year project. Includes role-based authentication, dashboard, departments, doctors, patient registration, appointments with overlap prevention, medical records, prescriptions, and optional email reminders.

## Stack
- Frontend: React, Vite, React Router, Axios, Lucide React, Recharts
- Backend: Node.js, Express, Mongoose, MongoDB Atlas
- Security: bcrypt password hashing, JWT, Helmet, rate limiting, role-based authorization
- Email: Nodemailer (optional SMTP configuration)

## Prerequisites
- Node.js 20+ recommended
- MongoDB Atlas cluster and database user
- Windows PowerShell (commands below work from the project root)

## Setup

### 1. Configure backend
```powershell
cd backend
Copy-Item .env.example .env
```
Edit `backend/.env` and set `MONGODB_URI`, a new random `JWT_SECRET` (at least 32 characters), and admin bootstrap values. Never commit `.env`.

### 2. Install backend packages
```powershell
npm install
```

### 3. Configure frontend
```powershell
cd ..\frontend
Copy-Item .env.example .env
npm install
```

### 4. Start the API
In a PowerShell window:
```powershell
cd C:\hospital-management-system\backend
npm run dev
```
Health endpoint: http://localhost:5000/api/health

### 5. Create the first admin
In another PowerShell window:
```powershell
cd C:\hospital-management-system\backend
npm run seed-admin
```
This creates an admin from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in backend `.env`. Change/remove bootstrap credentials after setup.

### 6. Start the frontend
In another PowerShell window:
```powershell
cd C:\hospital-management-system\frontend
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

## Default workflows
- Admin: create departments and doctors, view dashboard, manage appointments.
- Receptionist: register patients and create/manage appointments.
- Doctor: view assigned appointments and create clinical records/prescriptions.
- Patient: register from the login screen, view their own appointments and records.
- API endpoints are protected by JWT except health, login, and patient registration.

## API summary
- `POST /api/auth/register` — patient registration
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/departments`
- `GET/POST /api/doctors`
- `GET/POST /api/patients`
- `GET/POST/PATCH /api/appointments`
- `GET/POST /api/medical-records`
- `GET/POST /api/prescriptions`
- `GET /api/dashboard`
- `POST /api/notifications/test-email`

## Security and academic-project notes
This is a functional academic starter, not a certified clinical system. Before real-world use, add formal security review, backups, consent/retention policies, stronger audit controls, comprehensive tests, and deployment secrets management. Never store actual patient data in a demo deployment. Medical records are restricted by role and ownership in the API. Appointment overlap checks are enforced on the server, but a high-concurrency production system should add transactional/atomic scheduling guarantees.
