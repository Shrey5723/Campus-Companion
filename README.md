# 🎓 Campus Companion

A full-stack web application designed to help college students manage their academic life — track attendance, organize tasks, view timetables, and calculate safe bunk limits — all from a single, clean dashboard.

> Built as a **Semester 5 Full Stack Development** project.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Module | Description |
|---|---|
| **Authentication** | Register & login with JWT-based cookie authentication. Protected routes ensure only logged-in users access the dashboard. |
| **Dashboard** | Central hub displaying attendance summaries, upcoming schedule, and quick actions at a glance. |
| **Attendance Tracker** | Mark daily attendance per subject, view subject-wise statistics, and monitor overall attendance percentage with visual progress rings. |
| **Bunk Calculator** | Calculate how many lectures you can safely skip while staying above your required attendance threshold. |
| **Timetable** | View your weekly class schedule in an organized, day-wise layout. |
| **Todo / Task Manager** | Full CRUD task management with subtasks, priority levels, due dates, and toggle completion. |
| **Profile** | View and manage your student profile and enrollment details. |
| **Settings** | Configure app preferences including notification reminders. |
| **Dark / Light Theme** | Toggle between dark and light modes — preference persists across sessions. |
| **Animated Transitions** | Smooth page transitions and micro-animations powered by Framer Motion. |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library for building component-based interfaces |
| **Vite 6** | Lightning-fast dev server and build tool |
| **Redux Toolkit** | Centralized state management (auth, attendance, timetable, todos, holidays, theme, settings slices) |
| **React Router v7** | Client-side routing with protected routes |
| **Axios** | HTTP client for API communication |
| **Framer Motion** | Declarative animations and page transitions |
| **Bootstrap 5** | Responsive grid system and base styling |
| **React Icons** | Icon library for consistent UI iconography |
| **CSS Modules** | Scoped, component-level styling to avoid class name collisions |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express 5** | Minimal web framework for building RESTful APIs |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose** | ODM (Object Data Modeling) for MongoDB — schemas, validation, queries |
| **JSON Web Tokens (JWT)** | Stateless authentication via signed tokens stored in HTTP-only cookies |
| **bcrypt** | Password hashing for secure credential storage |
| **cookie-parser** | Middleware to parse cookies from incoming requests |
| **cors** | Cross-Origin Resource Sharing middleware for frontend ↔ backend communication |
| **dotenv** | Environment variable management |

### Dev Tools

| Tool | Purpose |
|---|---|
| **Nodemon** | Auto-restarts the backend server on file changes |
| **Git** | Version control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│   React 19 + Vite  ←→  Redux Store  ←→  Axios HTTP Client      │
│        ↕                                      ↕                 │
│   React Router v7                     API Layer (api/*.js)      │
│   (Protected Routes)                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │  HTTP (REST + Cookies)
                                 │  Port 5173 → Port 3000
┌────────────────────────────────▼────────────────────────────────┐
│                       SERVER (Node.js)                          │
│                                                                 │
│   Express 5 ──→ Middleware (CORS, JSON, Cookies, Auth)          │
│       ↕                                                         │
│   Routes ──→ Controllers ──→ Services ──→ Mongoose Models       │
│                                                 ↕               │
│                                          MongoDB Atlas          │
└─────────────────────────────────────────────────────────────────┘
```

The backend follows a **layered architecture** pattern:

- **Routes** — Define endpoints and attach middleware/validators
- **Controllers** — Handle request/response logic
- **Services** — Contain business logic (attendance calculations, auth flows, etc.)
- **Models** — Mongoose schemas defining data structure and validation
- **Validators** — Input validation before reaching controllers
- **Middleware** — Cross-cutting concerns (JWT auth verification)
- **Config** — Database connection and app constants

---

## 📁 Project Structure

```
Campus-Companion/
├── frontend/                        # React + Vite frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # Axios API layer
│   │   │   ├── axios.js             # Axios instance with base URL & interceptors
│   │   │   ├── auth.api.js          # Auth endpoints (login, register)
│   │   │   ├── attendance.api.js    # Attendance endpoints
│   │   │   ├── student.api.js       # Student profile endpoints
│   │   │   ├── timetable.api.js     # Timetable endpoints
│   │   │   ├── holiday.api.js       # Holiday endpoints
│   │   │   └── todo.api.js          # Todo CRUD endpoints
│   │   ├── components/
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Button/          # Button component + CSS Module
│   │   │   │   ├── Card/            # Card component + CSS Module
│   │   │   │   ├── Input/           # Input component + CSS Module
│   │   │   │   ├── Loader/          # Loading spinner
│   │   │   │   ├── Modal/           # Modal dialog
│   │   │   │   ├── Navbar/          # Top navigation bar
│   │   │   │   ├── Sidebar/         # Side navigation menu
│   │   │   │   ├── PageTransition/  # Framer Motion page wrapper
│   │   │   │   ├── ProgressRing/    # Circular progress indicator
│   │   │   │   ├── SubjectDetailModal/
│   │   │   │   ├── ThemeToggle/     # Dark/light mode switch
│   │   │   │   └── Toast/           # Toast notification system
│   │   │   └── todo/                # Todo-specific components
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Authentication hook
│   │   │   ├── useAttendance.js     # Attendance data hook
│   │   │   ├── useBunkCalculator.js # Bunk calculation logic
│   │   │   ├── useHolidays.js       # Holiday data hook
│   │   │   ├── useReminders.js      # Notification reminders
│   │   │   ├── useSettingsNotifications.js
│   │   │   ├── useTheme.js          # Theme management hook
│   │   │   └── useTimetable.js      # Timetable data hook
│   │   ├── layouts/
│   │   │   ├── AuthLayout/          # Layout for login/register pages
│   │   │   └── DashboardLayout/     # Layout with Navbar + Sidebar
│   │   ├── pages/
│   │   │   ├── LoginPage/
│   │   │   ├── RegisterPage/
│   │   │   ├── DashboardPage/
│   │   │   ├── AttendancePage/
│   │   │   ├── BunkCalculatorPage/
│   │   │   ├── TimetablePage/
│   │   │   ├── TodoPage/
│   │   │   ├── ProfilePage/
│   │   │   └── SettingsPage/
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx        # Route definitions
│   │   │   └── ProtectedRoute.jsx   # Auth guard component
│   │   ├── store/                   # Redux Toolkit store
│   │   │   ├── index.js             # Store configuration
│   │   │   ├── authSlice.js
│   │   │   ├── attendanceSlice.js
│   │   │   ├── timetableSlice.js
│   │   │   ├── holidaySlice.js
│   │   │   ├── themeSlice.js
│   │   │   ├── todoSlice.js
│   │   │   └── settingsSlice.js
│   │   ├── styles/
│   │   │   └── index.css            # Global styles & CSS variables
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point (React DOM render)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection setup
│   │   │   └── constants.js         # App-wide constants
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Login/register handlers
│   │   │   ├── student.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   └── todo.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verification middleware
│   │   ├── models/
│   │   │   ├── student.model.js     # Student schema
│   │   │   ├── attendance.model.js  # Attendance records schema
│   │   │   ├── todo.model.js        # Todo/task schema
│   │   │   ├── holiday.model.js     # Holiday dates schema
│   │   │   └── lectureAdjustment.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── student.route.js
│   │   │   ├── attendance.routes.js
│   │   │   └── todo.routes.js
│   │   ├── services/                # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── student.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── holiday.service.js
│   │   │   ├── lectureAdjustment.service.js
│   │   │   └── todo.service.js
│   │   ├── validators/              # Request input validation
│   │   │   ├── auth.validator.js
│   │   │   └── attendance.validator.js
│   │   ├── utils/                   # Utility functions
│   │   ├── data/                    # Seed/static data
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point (starts server)
│   ├── .env                         # Environment variables (not in git)
│   └── package.json
│
├── reports/                         # Practical lab reports (PDF + MD)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **MongoDB Atlas** cluster (or local MongoDB instance)

### 1. Clone the Repository

```bash
git clone https://github.com/Shrey5723/Campus-Companion.git
cd Campus-Companion
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

Start the backend dev server:

```bash
npm run dev
```

The backend will be running at `http://localhost:3000`.

### 3. Setup the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

### 4. Open the App

Navigate to [http://localhost:5173](http://localhost:5173) in your browser. Register a new account and start managing your campus life!

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing JWT tokens | A random 64-character hex string |
| `JWT_EXPIRES_IN` | JWT token expiration duration | `7d` |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new student |
| `POST` | `/api/auth/login` | Login and receive JWT cookie |

### Students

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students |
| `GET` | `/api/students/:enrollmentNo` | Get student by enrollment number |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/attendance/summary` | Get attendance summary for the student |
| `POST` | `/api/attendance/toggle` | Toggle attendance for a specific lecture |

### Todos

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/todos` | Get all todos for the logged-in user |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/:id` | Update a todo |
| `DELETE` | `/api/todos/:id` | Delete a todo |

> All routes under `/api/students`, `/api/attendance`, and `/api/todos` are **protected** — they require a valid JWT cookie.

---

## 🖼 Screenshots

> _Coming soon — add screenshots of the dashboard, attendance tracker, and other pages here._

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ for managing campus life better.
</p>
