import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '../../layouts/AuthLayout/AuthLayout'
import Input from '../../components/common/Input/Input'
import Button from '../../components/common/Button/Button'
import { useAuth } from '../../hooks/useAuth'
import styles from './RegisterPage.module.css'

// ──────────────────────────────────────────────
// Register Page
// Multi-step form: Academic → Personal → Password
// With client-side per-step validation & error handling
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const STEPS = [
    { num: 1, label: 'Academic' },
    { num: 2, label: 'Personal' },
    { num: 3, label: 'Security' }
]

const initialForm = {
    enrollmentNo: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    city: '',
    state: '',
    fullAddress: '',
    latitude: '',
    longitude: '',
    department: '',
    semester: '',
    division: '',
    password: '',
    confirmPassword: ''
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register, isAuthenticated, loading, error, clearError } = useAuth()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState(initialForm)
    const [localError, setLocalError] = useState('')
    const [geoLoading, setGeoLoading] = useState(false)

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setLocalError('Geolocation is not supported by your browser')
            return
        }
        setGeoLoading(true)
        setLocalError('')

        const onSuccess = async (position) => {
            const { latitude, longitude } = position.coords
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                )
                const data = await response.json()
                if (data?.address) {
                    const addr = data.address
                    setForm(prev => ({
                        ...prev,
                        city: addr.city || addr.town || addr.village || addr.county || '',
                        state: addr.state || '',
                        fullAddress: data.display_name || '',
                        latitude,
                        longitude
                    }))
                }
            } catch {
                // Even if reverse-geocoding fails, still store coordinates
                setForm(prev => ({ ...prev, latitude, longitude }))
                setLocalError('Got coordinates but could not fetch address. Please enter city/state manually.')
            }
            setGeoLoading(false)
        }

        const onError = (err) => {
            // If high-accuracy attempt failed, retry with low accuracy as fallback
            if (err.code === 2 || err.code === 3) {
                navigator.geolocation.getCurrentPosition(
                    onSuccess,
                    (fallbackErr) => {
                        setGeoLoading(false)
                        if (fallbackErr.code === 1) {
                            setLocalError('Location permission denied. Please allow location access in your browser settings.')
                        } else if (fallbackErr.code === 2) {
                            setLocalError('Location unavailable. Please ensure location services are enabled on your device.')
                        } else if (fallbackErr.code === 3) {
                            setLocalError('Location request timed out. Please check your network connection and try again.')
                        } else {
                            setLocalError('Failed to get location. Please enter your address manually.')
                        }
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
                )
                return
            }
            setGeoLoading(false)
            if (err.code === 1) {
                setLocalError('Location permission denied. Please allow location access in your browser settings.')
            } else {
                setLocalError('Failed to get location. Please enter your address manually.')
            }
        }

        navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        )
    }

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true })
    }, [isAuthenticated, navigate])

    useEffect(() => {
        return () => clearError()
    }, [clearError])

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setLocalError('')
        if (error) clearError()
    }

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!form.enrollmentNo.trim()) {
                setLocalError('Please enter your Enrollment Number')
                return false
            }
            if (!form.firstName.trim() || form.firstName.trim().length < 2) {
                setLocalError('First name must be at least 2 characters long')
                return false
            }
            if (!form.lastName.trim() || form.lastName.trim().length < 2) {
                setLocalError('Last name must be at least 2 characters long')
                return false
            }
            if (!form.department.trim()) {
                setLocalError('Please enter your Department')
                return false
            }
            if (!form.semester) {
                setLocalError('Please select your Semester')
                return false
            }
            if (!form.division) {
                setLocalError('Please select your Division')
                return false
            }
        }

        if (currentStep === 2) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(form.email.trim())) {
                setLocalError('Please enter a valid Email address')
                return false
            }
            const phoneStr = form.phone.replace(/\s|-/g, '')
            const phoneRegex = /^(\+91)?[6-9]\d{9}$/
            if (!phoneRegex.test(phoneStr)) {
                setLocalError('Please enter a valid 10-digit phone number')
                return false
            }
            if (!form.gender) {
                setLocalError('Please select your Gender')
                return false
            }
        }

        if (currentStep === 3) {
            if (form.password.length < 6) {
                setLocalError('Password must be at least 6 characters long')
                return false
            }
            if (form.password !== form.confirmPassword) {
                setLocalError('Password and Confirm Password do not match')
                return false
            }
        }

        setLocalError('')
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep(step)) return

        if (step < 3) {
            setStep(step + 1)
            return
        }

        const result = await register({
            ...form,
            semester: parseInt(form.semester, 10),
            address: {
                city: form.city,
                state: form.state,
                fullAddress: form.fullAddress,
                latitude: form.latitude === '' ? undefined : Number(form.latitude),
                longitude: form.longitude === '' ? undefined : Number(form.longitude)
            }
        })

        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/dashboard', { replace: true })
        } else if (result.meta.requestStatus === 'rejected') {
            const errMsg = (result.payload || '').toLowerCase()
            if (errMsg.includes('enrollment') || errMsg.includes('first name') || errMsg.includes('last name') || errMsg.includes('department') || errMsg.includes('semester') || errMsg.includes('division')) {
                setStep(1)
            } else if (errMsg.includes('email') || errMsg.includes('phone') || errMsg.includes('gender')) {
                setStep(2)
            }
        }
    }

    const renderStepIndicator = () => (
        <div className={styles.steps}>
            {STEPS.map((s, i) => (
                <div key={s.num} className={styles.step}>
                    <div className={`
                        ${step === s.num ? styles.stepActive : ''}
                        ${step > s.num ? styles.stepCompleted : ''}
                    `}>
                        <div className={styles.stepDot}>
                            {step > s.num ? (
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                            ) : s.num}
                        </div>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`${styles.stepLine} ${step > s.num ? styles.stepLineActive : ''}`} />
                    )}
                </div>
            ))}
        </div>
    )

    const renderStep = () => {
        const variants = {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 }
        }

        switch (step) {
            case 1:
                return (
                    <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                        <div className={styles.form}>
                            <Input label="Enrollment Number" name="enrollmentNo" value={form.enrollmentNo} onChange={handleChange} placeholder="e.g., 23BCE001" icon="tag" required />
                            <div className={styles.row}>
                                <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" icon="person" required />
                                <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required />
                            </div>
                            <Input label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g., Computer Engineering" icon="apartment" required />
                            <div className={styles.row}>
                                <Input label="Semester" name="semester" type="select" value={form.semester} onChange={handleChange} options={['1','2','3','4','5','6','7','8']} placeholder="Select semester" required />
                                <Input label="Division" name="division" type="select" value={form.division} onChange={handleChange} options={['D1','D2','D3','D4']} placeholder="Select division" required />
                            </div>
                        </div>
                    </motion.div>
                )
            case 2:
                return (
                    <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                        <div className={styles.form}>
                            <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" icon="mail" required />
                            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit phone number" icon="phone" required />
                            <Input label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} placeholder="Select gender" required />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>Address (Optional)</span>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon="my_location"
                                    onClick={handleUseLocation}
                                    loading={geoLoading}
                                >
                                    Current Location
                                </Button>
                            </div>
                            <div className={styles.row}>
                                <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" icon="location_city" />
                                <Input label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
                            </div>
                            {form.fullAddress && (
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '0 0 var(--space-2)' }}>
                                    Detected: {form.fullAddress}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )
            case 3:
                return (
                    <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                        <div className={styles.form}>
                            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" icon="lock" required />
                            <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" icon="lock" required />
                        </div>
                    </motion.div>
                )
            default:
                return null
        }
    }

    const displayError = localError || error

    return (
        <AuthLayout wide>
            <AuthLayout.Header
                title="Create Account"
                subtitle={`Step ${step} of 3 — ${STEPS[step - 1].label} Info`}
            />

            {renderStepIndicator()}

            <AuthLayout.Error message={displayError} />

            <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>

                <div className={styles.actions} style={{ marginTop: 'var(--space-6)' }}>
                    {step > 1 && (
                        <Button
                            variant="secondary"
                            onClick={(e) => { e.preventDefault(); setLocalError(''); clearError(); setStep(step - 1) }}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        type="submit"
                        fullWidth={step === 1}
                        loading={loading && step === 3}
                        size="lg"
                    >
                        {step < 3 ? 'Continue' : 'Create Account'}
                    </Button>
                </div>
            </form>

            <AuthLayout.Footer>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Sign in
                </Link>
            </AuthLayout.Footer>
        </AuthLayout>
    )
}
