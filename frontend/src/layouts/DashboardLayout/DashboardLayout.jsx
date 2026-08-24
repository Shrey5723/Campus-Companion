import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar/Sidebar'
import Navbar from '../../components/common/Navbar/Navbar'
import { useSettingsNotifications } from '../../hooks/useSettingsNotifications'
import styles from './DashboardLayout.module.css'

// ──────────────────────────────────────────────
// DashboardLayout
// Sidebar + Navbar + content area
// Dynamically sets page title based on current route
// ──────────────────────────────────────────────

const ROUTE_TITLES = {
    '/dashboard': 'Dashboard',
    '/attendance': 'Attendance',
    '/bunk-calculator': 'Bunk Calculator',
    '/timetable': 'Timetable',
    '/todos': 'To-Do List',
    '/settings': 'Settings',
    '/profile': 'Student Profile'
}

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    useSettingsNotifications()

    const title = ROUTE_TITLES[location.pathname] || 'Dashboard'

    return (
        <div className={styles.layout}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className={styles.main}>
                <Navbar
                    title={title}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                />
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
