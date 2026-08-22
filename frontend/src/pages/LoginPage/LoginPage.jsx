import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout/AuthLayout'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import { useAuth } from '../../hooks/useAuth'
import styles from './LoginPage.module.css'

// ──────────────────────────────────────────────
// Login Page
// Glassmorphism card with email + password form
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, isAuthenticated, loading, error, clearError } = useAuth()

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    // Clear errors on unmount
    useEffect(() => {
        return () => clearError()
    }, [clearError])

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await login(form.email, form.password)
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/dashboard', { replace: true })
        }
    }

    return (
        <AuthLayout>
            <AuthLayout.Header
                title="Welcome back"
                subtitle="Sign in to your Campus Companion account"
            />

            <AuthLayout.Error message={error} />

            <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@university.edu"
                    icon="mail"
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    icon="lock"
                    required
                />

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                >
                    Sign In
                </Button>
            </form>

            <AuthLayout.Footer>
                Don&apos;t have an account?{' '}
                <Link to="/register" className={styles.forgotLink}>
                    Register here
                </Link>
            </AuthLayout.Footer>
        </AuthLayout>
    )
}
