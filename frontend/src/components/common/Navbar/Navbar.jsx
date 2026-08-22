import ThemeToggle from '../ThemeToggle/ThemeToggle'
import { useAuth } from '../../../hooks/useAuth'
import styles from './Navbar.module.css'

// ──────────────────────────────────────────────
// Navbar Component
// Top bar with page title, greeting, theme toggle
// Mobile: shows hamburger menu button
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function Navbar({ title, onMenuClick }) {
    const { user } = useAuth()

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 16) return 'Good afternoon'
        if (hour < 20) return 'Good evening'
        return 'Good night'
    }

    return (
        <header className={styles.navbar}>
            <div className={styles.left}>
                <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Toggle menu">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
                </button>
                <h1 className={styles.pageTitle}>{title}</h1>
            </div>
            <div className={styles.right}>
                <span className={styles.greeting}>
                    {getGreeting()},{' '}
                    <span className={styles.greetingName}>{user?.firstName}</span>
                </span>
                <ThemeToggle />
            </div>
        </header>
    )
}
