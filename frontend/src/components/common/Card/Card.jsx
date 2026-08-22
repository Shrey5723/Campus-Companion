import { motion } from 'framer-motion'
import styles from './Card.module.css'

// ──────────────────────────────────────────────
// Card Component
// Variants: default | glass | flat | elevated
// Features: hoverable, accent border, compact
// ──────────────────────────────────────────────

export default function Card({
    children,
    variant = 'default',
    hoverable = false,
    compact = false,
    noPadding = false,
    accentColor,
    className = '',
    animate = true,
    delay = 0,
    onClick,
    ...props
}) {
    const classes = [
        styles.card,
        variant !== 'default' && styles[variant],
        hoverable && styles.hoverable,
        compact && styles.compact,
        noPadding && styles.noPadding,
        accentColor && styles.accentBorder,
        accentColor && styles[`accentBorder${accentColor.charAt(0).toUpperCase() + accentColor.slice(1).toLowerCase()}`],
        className
    ].filter(Boolean).join(' ')

    if (!animate) {
        return (
            <div className={classes} onClick={onClick} {...props}>
                {children}
            </div>
        )
    }

    return (
        <motion.div
            className={classes}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
