import { useState, useCallback } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import styles from './Sidebar.module.css'

// ──────────────────────────────────────────────
// Sidebar Component
// Fixed navigation with brand, draggable nav links,
// clickable user profile card, and settings option
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const DEFAULT_NAV_ITEMS = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/attendance', icon: 'calendar_month', label: 'Attendance' },
    { to: '/bunk-calculator', icon: 'calculate', label: 'Bunk Calculator' },
    { to: '/timetable', icon: 'schedule', label: 'Timetable' },
    { to: '/todos', icon: 'checklist', label: 'To-Do List' },
    { to: '/settings', icon: 'settings', label: 'Settings' }
]

function loadNavOrder() {
    try {
        const saved = localStorage.getItem('cc_nav_order')
        if (saved) {
            const savedKeys = JSON.parse(saved)
            const map = new Map(DEFAULT_NAV_ITEMS.map(item => [item.to, item]))
            const reordered = savedKeys.map(key => map.get(key)).filter(Boolean)
            const missing = DEFAULT_NAV_ITEMS.filter(item => !savedKeys.includes(item.to))
            return [...reordered, ...missing]
        }
    } catch {
        // ignore
    }
    return DEFAULT_NAV_ITEMS
}

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth()
    const [navItemsList, setNavItemsList] = useState(loadNavOrder)
    const [dragOverIdx, setDragOverIdx] = useState(null)

    const initials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
        : '?'

    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        setDragOverIdx(index)
    }

    const handleDrop = (e, dropIndex) => {
        e.preventDefault()
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
        if (isNaN(fromIndex) || fromIndex === dropIndex) return

        const newList = [...navItemsList]
        const [moved] = newList.splice(fromIndex, 1)
        newList.splice(dropIndex, 0, moved)
        setNavItemsList(newList)
        setDragOverIdx(null)
        try {
            localStorage.setItem('cc_nav_order', JSON.stringify(newList.map(i => i.to)))
        } catch {
            // ignore
        }
    }

    return (
        <>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose} />
            )}
            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                {/* Brand */}
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>CC</div>
                    <div className={styles.brandText}>
                        <span className={styles.brandName}>Campus Companion</span>
                        <span className={styles.brandSub}>Attendance Tracker</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <span className={styles.navLabel}>Menu (Drag to reorder)</span>
                    {navItemsList.map(({ to, icon, label }, index) => (
                        <div
                            key={to}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={() => setDragOverIdx(null)}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`${styles.navItemWrapper} ${dragOverIdx === index ? styles.navItemDragOver : ''}`}
                        >
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                                }
                                onClick={onClose}
                            >
                                <span className={`${styles.navIcon} material-symbols-outlined`}>
                                    {icon}
                                </span>
                                <span style={{ flex: 1 }}>{label}</span>
                                <span className={`material-symbols-outlined ${styles.dragGrip}`} style={{ fontSize: 16, opacity: 0.35 }}>
                                    drag_handle
                                </span>
                            </NavLink>
                        </div>
                    ))}
                </nav>

                {/* Footer — User Info (Clickable for Profile) + Settings & Logout */}
                <div className={styles.footer}>
                    <div className={styles.userRow}>
                        <Link to="/profile" className={styles.userInfo} onClick={onClose} title="View and edit profile">
                            <div className={styles.avatar}>{initials}</div>
                            <div className={styles.userDetails}>
                                <div className={styles.userName}>
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className={styles.userRole}>
                                    {user?.enrollmentNo} · Edit Profile
                                </div>
                            </div>
                        </Link>
                        <Link to="/settings" className={styles.settingsBtn} onClick={onClose} title="Settings">
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                settings
                            </span>
                        </Link>
                    </div>
                    <button className={styles.navItem} onClick={logout}>
                        <span className={`${styles.navIcon} material-symbols-outlined`}>
                            logout
                        </span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}
