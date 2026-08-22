import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import styles from './ProgressRing.module.css'

// ──────────────────────────────────────────────
// ProgressRing Component
// SVG circular progress indicator
// Animated on mount with spring physics
// Color changes based on percentage
// ──────────────────────────────────────────────

export default function ProgressRing({
    percentage = 0,
    size = 100,
    strokeWidth = 8,
    color,
    showLabel = true,
    subLabel,
    className = ''
}) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    // Animated percentage counter
    const spring = useSpring(0, { stiffness: 60, damping: 15 })
    const displayValue = useTransform(spring, (v) => Math.round(v))
    const [displayNum, setDisplayNum] = useState(0)

    useEffect(() => {
        spring.set(percentage)
        const unsubscribe = displayValue.on('change', (v) => setDisplayNum(v))
        return unsubscribe
    }, [percentage, spring, displayValue])

    // Calculate stroke color based on percentage
    const getColor = () => {
        if (color) return color
        if (percentage >= 75) return 'var(--success)'
        if (percentage >= 60) return 'var(--warning)'
        return 'var(--danger)'
    }

    const dashOffset = circumference - (percentage / 100) * circumference

    return (
        <div className={`${styles.wrapper} ${className}`} style={{ width: size, height: size }}>
            <svg className={styles.ring} width={size} height={size}>
                <circle
                    className={styles.bgCircle}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    className={styles.progressCircle}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={getColor()}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            {showLabel && (
                <div className={styles.label}>
                    <span
                        className={styles.percentage}
                        style={{ fontSize: size * 0.22, color: getColor() }}
                    >
                        {displayNum}%
                    </span>
                    {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
                </div>
            )}
        </div>
    )
}
