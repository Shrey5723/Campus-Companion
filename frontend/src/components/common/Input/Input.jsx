import { useState } from 'react'
import styles from './Input.module.css'

// ──────────────────────────────────────────────
// Input Component
// Supports: text, email, password, number, select
// Features: icon left (Material Symbol name), error state, password toggle
// ──────────────────────────────────────────────

export default function Input({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    required = false,
    icon,
    options,
    className = '',
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    // Select variant
    if (type === 'select' && options) {
        return (
            <div className={`${styles.inputGroup} ${error ? styles.error : ''} ${className}`}>
                {label && (
                    <label className={styles.label} htmlFor={name}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={styles.select}
                    {...props}
                >
                    <option value="">{placeholder || 'Select...'}</option>
                    {options.map(opt => (
                        <option key={opt.value || opt} value={opt.value || opt}>
                            {opt.label || opt}
                        </option>
                    ))}
                </select>
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        )
    }

    return (
        <div className={`${styles.inputGroup} ${error ? styles.error : ''} ${className}`}>
            {label && (
                <label className={styles.label} htmlFor={name}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={styles.inputWrapper}>
                {icon && (
                    <span className={`material-symbols-outlined ${styles.iconLeft}`} style={{ fontSize: 18 }}>
                        {icon}
                    </span>
                )}
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${styles.input} ${icon ? styles.hasIcon : ''}`}
                    {...props}
                />
                {isPassword && (
                    <span
                        className={styles.iconRight}
                        onClick={() => setShowPassword(!showPassword)}
                        role="button"
                        tabIndex={0}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </span>
                )}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}
