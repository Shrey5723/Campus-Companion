import { useTheme } from '../../../hooks/useTheme'
import styles from './ThemeToggle.module.css'

// ──────────────────────────────────────────────
// ThemeToggle Component
// Three modes: Light | Dark | System
// Visual slider indicates active mode
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const themes = [
    { key: 'light', icon: 'light_mode', label: 'Light' },
    { key: 'dark', icon: 'dark_mode', label: 'Dark' },
    { key: 'system', icon: 'desktop_windows', label: 'System' }
]

export default function ThemeToggle() {
    const { mode, setTheme } = useTheme()

    const activeIndex = themes.findIndex(t => t.key === mode)

    return (
        <div className={styles.toggle} role="radiogroup" aria-label="Theme selection">
            <div
                className={`${styles.slider} ${styles[`pos${activeIndex}`]}`}
            />
            {themes.map(({ key, icon, label }) => (
                <button
                    key={key}
                    className={`${styles.option} ${mode === key ? styles.active : ''}`}
                    onClick={() => setTheme(key)}
                    role="radio"
                    aria-checked={mode === key}
                    aria-label={label}
                    title={label}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {icon}
                    </span>
                </button>
            ))}
        </div>
    )
}
