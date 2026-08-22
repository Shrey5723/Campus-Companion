import styles from './Loader.module.css'

// ──────────────────────────────────────────────
// Loader Component
// Variants: fullPage | inline
// Also exports Skeleton components
// ──────────────────────────────────────────────

export default function Loader({ text = 'Loading...', fullPage = false }) {
    return (
        <div className={`${styles.loader} ${fullPage ? styles.fullPage : styles.inline}`}>
            <div className={styles.spinner} />
            {text && <span className={styles.text}>{text}</span>}
        </div>
    )
}

export function SkeletonLine({ width = '100%', height = '14px' }) {
    return <div className={styles.skeletonLine} style={{ width, height }} />
}

export function SkeletonCircle({ size = '40px' }) {
    return <div className={styles.skeletonCircle} style={{ width: size, height: size }} />
}

export function SkeletonCard() {
    return <div className={styles.skeletonCard} />
}
