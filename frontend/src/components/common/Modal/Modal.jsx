import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Modal.module.css'

// ──────────────────────────────────────────────
// Modal Component
// Animated overlay + centered content
// Closes on Escape key and overlay click
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function Modal({ isOpen, onClose, title, children, footer, wide }) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`${styles.modal} ${wide ? styles.modalWide : ''}`}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <div className={styles.header}>
                                <h3 className={styles.title}>{title}</h3>
                                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                                </button>
                            </div>
                        )}
                        <div className={styles.body}>
                            {children}
                        </div>
                        {footer && (
                            <div className={styles.footer}>
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
