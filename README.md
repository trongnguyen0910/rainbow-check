# 🌈 Rainbow AMS — Attendance Management System

A production-ready, full-stack Attendance Management System built with **React + Vite** (frontend) and **Node.js + Express** (backend), using **in-memory mock data** (no database required to run).

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
# → Running on http://localhost:5000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Accounts

| Role     | Username      | Password     |
|----------|---------------|--------------|
| Admin    | `admin`       | `Admin@123`  |
| HR       | `hr_manager`  | `Hr@123`     |
| Manager  | `manager_eng` | `Manager@123`|
| Employee | `emp001`      | `Emp@123`    |

> **Tip:** Click the demo account buttons on the login page to auto-fill credentials.

---

## 📁 Project Structure

```
RAINBOW2/
├── backend/             # Express REST API
│   ├── src/
│   │   ├── data/        # mockData.js — in-memory database
│   │   ├── middleware/  # auth.js (JWT), rbac.js (roles)
│   │   ├── controllers/ # Business logic per feature
│   │   ├── routes/      # Express routers
│   │   └── utils/       # response.js
│   ├── .env
│   └── server.js
│
└── frontend/            # React + Vite + TailwindCSS
    └── src/
        ├── api/         # Axios API modules
        ├── components/  # Layout, UI components
        ├── context/     # AuthContext, ThemeContext
        ├── pages/       # All page components
        └── routes/      # ProtectedRoute
```

---

## 🧩 Features

| Feature            | Status | Notes |
|--------------------|--------|-------|
| Login (JWT)        | ✅     | Role-based access |
| Dashboard          | ✅     | Live clock, charts, KPIs |
| Employee CRUD      | ✅     | Search, filter, paginate |
| Attendance Tracking| ✅     | Check-in/out with modal |
| Leave Management   | ✅     | Submit, approve, reject |
| Reports & Export   | ✅     | Excel + CSV download |
| Notifications      | ✅     | Per-user, mark as read |
| Settings           | ✅     | Work hours, timezone |
| Profile            | ✅     | Avatar color, edit info |
| Dark Mode          | ✅     | Persisted in localStorage |

---

## 🔌 Integrating Real MySQL Database

The `backend/src/data/mockData.js` file acts as a drop-in replacement for a MySQL database.

To integrate MySQL:

1. Install `mysql2`:
   ```bash
   npm install mysql2
   ```

2. Create `src/config/db.js` with a connection pool.

3. Replace each function in `mockData.js` with SQL queries.
   - `db.employees` → `SELECT * FROM employees`
   - `db.attendance` → `SELECT * FROM attendance`
   - etc.

4. A sample `database/schema.sql` will be provided for the full schema.

---

## 🌐 API Endpoints

| Method | Endpoint                        | Auth | Roles            |
|--------|---------------------------------|------|------------------|
| POST   | `/api/auth/login`               | No   | –                |
| GET    | `/api/auth/me`                  | JWT  | All              |
| GET    | `/api/dashboard/stats`          | JWT  | All              |
| GET    | `/api/employees`                | JWT  | All              |
| POST   | `/api/employees`                | JWT  | Admin, HR        |
| PUT    | `/api/employees/:id`            | JWT  | Admin, HR        |
| DELETE | `/api/employees/:id`            | JWT  | Admin            |
| GET    | `/api/attendance`               | JWT  | All (filtered)   |
| POST   | `/api/attendance/checkin`       | JWT  | Employee         |
| POST   | `/api/attendance/checkout`      | JWT  | Employee         |
| GET    | `/api/leaves`                   | JWT  | All (filtered)   |
| POST   | `/api/leaves`                   | JWT  | Employee         |
| PUT    | `/api/leaves/:id/approve`       | JWT  | Admin, HR, Mgr   |
| PUT    | `/api/leaves/:id/reject`        | JWT  | Admin, HR, Mgr   |
| GET    | `/api/reports/monthly`          | JWT  | All              |
| GET    | `/api/reports/export`           | JWT  | Admin, HR        |
| GET    | `/api/notifications`            | JWT  | All              |
| GET    | `/api/settings`                 | JWT  | All              |
| PUT    | `/api/settings`                 | JWT  | Admin            |

---

## 🎨 Tech Stack

**Frontend:**
- React 18 + Vite 8
- TailwindCSS 3 (custom design system)
- React Router v6
- Recharts (area/bar charts)
- React Hook Form
- Lucide React icons
- React Hot Toast
- date-fns

**Backend:**
- Node.js + Express
- jsonwebtoken (JWT auth)
- bcryptjs (password hashing)
- xlsx (Excel/CSV export)
- cors, dotenv

---

## 📝 License

Internal use — Rainbow Corporation © 2026
