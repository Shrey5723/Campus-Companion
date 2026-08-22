import { motion } from 'framer-motion'

// ──────────────────────────────────────────────
// PageTransition
// Wraps page content with fade + slide animation
// Used inside each page component
// ──────────────────────────────────────────────

const pageVariants = {
    initial: {
        opacity: 0,
        y: 16
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -16
    }
}

export default function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}
