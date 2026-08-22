import { motion } from 'framer-motion'
import ThemeToggle from '../../components/common/ThemeToggle/ThemeToggle'
import styles from './AuthLayout.module.css'

// ──────────────────────────────────────────────
// AuthLayout
// Centered glassmorphism card with animated background
// Used for Login and Register pages
// ──────────────────────────────────────────────

export default function AuthLayout({ children, wide = false }) {
    return (
        <div className={styles.container}>
            {/* Decorative Background */}
            <div className={styles.bgDecor}>
                <div className={styles.bgOrb1} />
                <div className={styles.bgOrb2} />
                <div className={styles.bgGrid} />
            </div>

            {/* Theme Toggle */}
            <div className={styles.themeTogglePos}>
                <ThemeToggle />
            </div>

            {/* Card */}
            <motion.div
                className={`${styles.card} ${wide ? styles.cardWide : ''}`}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className={`${styles.cardInner} ${wide ? styles.cardInnerCompact : ''}`}>
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

// Sub-components for consistent layout
AuthLayout.Header = function AuthHeader({ title, subtitle }) {
    return (
        <div className={styles.header}>
            <div className={styles.logo}>CC</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
        </div>
    )
}

AuthLayout.Footer = function AuthFooter({ children }) {
    return <div className={styles.footer}>{children}</div>
}

AuthLayout.Error = function AuthError({ message }) {
    if (!message) return null
    return <div className={styles.errorAlert}>{message}</div>
}
