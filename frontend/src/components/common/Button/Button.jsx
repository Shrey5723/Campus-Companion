import { motion } from 'framer-motion'
import styles from './Button.module.css'

// ──────────────────────────────────────────────
// Button Component
// Variants: primary | secondary | ghost | danger
// Sizes: sm | md (default) | lg
// icon: Material Symbols icon name string (e.g. 'add')
// ──────────────────────────────────────────────

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon,
    onClick,
    type = 'button',
    className = '',
    ...props
}) {
    const classes = [
        styles.btn,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.full,
        className
    ].filter(Boolean).join(' ')

    return (
        <motion.button
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            whileTap={{ scale: 0.97 }}
            {...props}
        >
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && (
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {icon}
                        </span>
                    )}
                    {children}
                </>
            )}
        </motion.button>
    )
}
