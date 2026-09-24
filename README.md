# 📋 Leave Management System - MERN Stack

## 🚀 Project Structure
```
leave/
├── backend/          ← Node.js + Express + MongoDB
│   ├── config/       ← DB connection
│   ├── controllers/  ← Business logic
│   ├── middleware/   ← Auth & role check
│   ├── models/       ← MongoDB schemas
│   ├── routes/       ← API endpoints
│   ├── .env          ← Environment variables
│   └── server.js     ← Entry point
│
└── frontend/         ← React + Vite
    └── src/
        ├── api/      ← Axios config
        ├── context/  ← Auth state (global)
        ├── components/ ← Navbar, Sidebar, Layout
        └── pages/    ← All screens
```

## ⚙️ Setup & Run

### Step 1: Start MongoDB
Use local MongoDB or MongoDB Atlas.
Set `MONGO_URI` in `.env`.

### Step 2: Backend
```bash
cd backend
npm install
npm run dev
# ✅ Running on http://localhost:5000
```

### Step 3: Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:5173
```

## 👥 3 Roles

| Role | Access |
|------|--------|
| **Employee** | Apply leave, view own leaves, cancel pending |
| **Manager** | Employee + approve/reject team leaves, view team |
| **Admin** | Full access - manage users, final leave approval |

## 🔄 Leave Flow
```
Employee applies → Manager approves → Admin final approval
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Profile (protected)

### Leaves
- `POST /api/leaves/apply` - Apply leave
- `GET /api/leaves/my` - My leaves
- `GET /api/leaves/team` - Team leaves (Manager)
- `GET /api/leaves/all` - All leaves (Admin)
- `PUT /api/leaves/:id/cancel` - Cancel leave
- `PUT /api/leaves/:id/manager-action` - Manager approve/reject
- `PUT /api/leaves/:id/admin-action` - Admin final decision

### Users (Admin)
- `GET /api/users` - All users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
