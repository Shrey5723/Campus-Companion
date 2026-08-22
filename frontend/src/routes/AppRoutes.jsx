import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout'
import LoginPage from '../pages/LoginPage/LoginPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import DashboardPage from '../pages/DashboardPage/DashboardPage'
import AttendancePage from '../pages/AttendancePage/AttendancePage'
import BunkCalculatorPage from '../pages/BunkCalculatorPage/BunkCalculatorPage'
import TimetablePage from '../pages/TimetablePage/TimetablePage'
import TodoPage from '../pages/TodoPage/TodoPage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'

// ──────────────────────────────────────────────
// App Routes
// Public: /login, /register
// Protected: /dashboard, /attendance, /bunk-calculator, /timetable, /todos, /settings, /profile
// ──────────────────────────────────────────────

export default function AppRoutes() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes — wrapped in DashboardLayout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/bunk-calculator" element={<BunkCalculatorPage />} />
                    <Route path="/timetable" element={<TimetablePage />} />
                    <Route path="/todos" element={<TodoPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AnimatePresence>
    )
}
