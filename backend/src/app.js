const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

// Import route files
const studentRouter = require('./routes/student.route')
const authRouter = require('./routes/auth.routes')
const attendanceRouter = require('./routes/attendance.routes')
const todoRouter = require('./routes/todo.routes')

const app = express()

// ──────────────────────────────────────────────
// Middleware Setup
// Middleware runs in the ORDER it is registered.
// These run on EVERY request before reaching any route.
// ──────────────────────────────────────────────

// 1. CORS (Cross-Origin Resource Sharing)
// WHY: The React frontend runs on http://localhost:5173 (Vite's default)
// but the backend runs on http://localhost:3000.
// Browsers block requests between different origins by default (security feature).
// CORS tells the browser: "It's okay, allow requests from this origin."
//
// credentials: true is required because we're using cookies.
// Without it, the browser won't send or accept cookies cross-origin.
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// 2. JSON Parser
// Parses incoming JSON request bodies (e.g., from POST requests)
// and makes the data available at req.body
app.use(express.json())

// 3. Cookie Parser
// Parses cookies from incoming requests and makes them
// available at req.cookies (e.g., req.cookies.token)
// This is needed for our JWT authentication system.
app.use(cookieParser())

// ──────────────────────────────────────────────
// Routes
// Each router handles a specific group of endpoints.
// ──────────────────────────────────────────────

// Auth routes: /api/auth/register, /api/auth/login
app.use('/api/auth', authRouter)

// Student routes: /api/students, /api/students/:enrollmentNo
app.use('/api/students', studentRouter)

// Attendance routes: /api/attendance/summary, /api/attendance/toggle, etc.
app.use('/api/attendance', attendanceRouter)

// Todo routes: /api/todos (CRUD, toggle, subtasks, etc.)
app.use('/api/todos', todoRouter)

module.exports = app