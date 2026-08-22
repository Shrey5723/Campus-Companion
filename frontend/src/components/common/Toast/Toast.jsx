import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Toast.module.css'

// ──────────────────────────────────────────────
// Toast System
// Context-based toast notifications
// Usage: const { addToast } = useToast()
//        addToast({ type: 'success', message: 'Done!' })
//        or toast.success('Done!')
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const ToastContext = createContext(null)

const iconNames = {
    success: 'check',
    error: 'error',
    warning: 'warning',
    info: 'info'
}

let toastId = 0

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, type, title, message, duration }])

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const success = useCallback((message, title) => addToast({ type: 'success', message, title }), [addToast])
    const error = useCallback((message, title) => addToast({ type: 'error', message, title }), [addToast])
    const warning = useCallback((message, title) => addToast({ type: 'warning', message, title }), [addToast])
    const info = useCallback((message, title) => addToast({ type: 'info', message, title }), [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <div className={styles.toastContainer}>
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onClose }) {
    const iconName = iconNames[toast.type] || 'info'

    return (
        <motion.div
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            layout
        >
            <div className={styles.iconWrapper}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {iconName}
                </span>
            </div>
            <div className={styles.content}>
                {toast.title && <div className={styles.title}>{toast.title}</div>}
                <div className={styles.message}>{toast.message}</div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
            {toast.duration > 0 && (
                <motion.div
                    className={styles.progress}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                />
            )}
        </motion.div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
