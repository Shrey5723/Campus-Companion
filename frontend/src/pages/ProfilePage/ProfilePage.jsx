import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import Button from '../../components/common/Button/Button'
import Input from '../../components/common/Input/Input'
import { useAuth } from '../../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { updateProfileThunk } from '../../store/authSlice'
import { useToast } from '../../components/common/Toast/Toast'
import styles from './ProfilePage.module.css'

// ──────────────────────────────────────────────
// Profile Page
// Displays and allows editing of student profile
// Includes Geolocation API for address auto-fill
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function ProfilePage() {
    const { user, loading } = useAuth()
    const dispatch = useDispatch()
    const { addToast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [geoLoading, setGeoLoading] = useState(false)
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        department: user?.department || '',
        semester: user?.semester?.toString() || '',
        division: user?.division || '',
        batch: user?.batch || '',
        cgpa: user?.cgpa?.toString() || '',
        skills: user?.skills?.join(', ') || '',
        clubs: user?.clubs?.join(', ') || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        fullAddress: user?.address?.fullAddress || '',
        latitude: user?.address?.latitude ?? '',
        longitude: user?.address?.longitude ?? ''
    })

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleEdit = () => {
        setIsEditing(true)
        setForm({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || '',
            gender: user?.gender || '',
            department: user?.department || '',
            semester: user?.semester?.toString() || '',
            division: user?.division || '',
            batch: user?.batch || '',
            cgpa: user?.cgpa?.toString() || '',
            skills: user?.skills?.join(', ') || '',
            clubs: user?.clubs?.join(', ') || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            fullAddress: user?.address?.fullAddress || '',
            latitude: user?.address?.latitude ?? '',
            longitude: user?.address?.longitude ?? ''
        })
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    const handleSave = useCallback(async () => {
        const profileData = {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            gender: form.gender,
            department: form.department,
            semester: parseInt(form.semester) || undefined,
            division: form.division,
            batch: form.batch || undefined,
            cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
            skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
            clubs: form.clubs ? form.clubs.split(',').map(s => s.trim()).filter(Boolean) : [],
            address: {
                city: form.city,
                state: form.state,
                fullAddress: form.fullAddress,
                latitude: form.latitude === '' ? null : Number(form.latitude),
                longitude: form.longitude === '' ? null : Number(form.longitude)
            }
        }

        const result = await dispatch(updateProfileThunk(profileData))
        if (result.meta.requestStatus === 'fulfilled') {
            setIsEditing(false)
            addToast({ type: 'success', message: 'Profile updated successfully!' })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to update profile' })
        }
    }, [form, dispatch, addToast])

    // ─── Geolocation API ───
    const handleUseLocation = useCallback(() => {
        if (!navigator.geolocation) {
            addToast({ type: 'error', message: 'Geolocation is not supported by your browser' })
            return
        }

        setGeoLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    // Reverse geocode using free Nominatim API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
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
                        addToast({ type: 'success', message: 'Location detected successfully!' })
                    }
                } catch {
                    addToast({ type: 'error', message: 'Failed to get address from location' })
                }
                setGeoLoading(false)
            },
            (error) => {
                setGeoLoading(false)
                let msg = 'Failed to get location'
                if (error.code === 1) msg = 'Location permission denied'
                if (error.code === 2) msg = 'Location unavailable'
                if (error.code === 3) msg = 'Location request timed out'
                addToast({ type: 'error', message: msg })
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [addToast])

    const initials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
        : '?'

    const infoItem = (icon, label, value) => (
        <div className={styles.infoItem}>
            <span className={`material-symbols-outlined ${styles.infoIcon}`}>{icon}</span>
            <div className={styles.infoContent}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{value || '—'}</span>
            </div>
        </div>
    )

    return (
        <PageTransition className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>My Profile</h2>
                    <p>View and manage your personal information</p>
                </div>
                {!isEditing && (
                    <Button icon="edit" onClick={handleEdit}>Edit Profile</Button>
                )}
            </div>

            {/* ─── Profile Card ─── */}
            <motion.div
                className={styles.profileCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.profileHeader}>
                    <div className={styles.avatarLarge}>{initials}</div>
                    <div className={styles.profileName}>
                        <h3>{user?.firstName} {user?.lastName}</h3>
                        <span className={styles.enrollmentBadge}>{user?.enrollmentNo}</span>
                        <span className={styles.roleBadge}>{user?.role || 'Student'}</span>
                    </div>
                </div>
            </motion.div>

            {isEditing ? (
                /* ─── Edit Mode ─── */
                <motion.div
                    className={styles.editSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.editCard}>
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                            Personal Information
                        </h4>
                        <div className={styles.formGrid}>
                            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} icon="person" />
                            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
                            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} icon="phone" />
                            <Input label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                        </div>
                    </div>

                    <div className={styles.editCard}>
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>school</span>
                            Academic Information
                        </h4>
                        <div className={styles.formGrid}>
                            <Input label="Department" name="department" value={form.department} onChange={handleChange} icon="apartment" />
                            <Input label="Semester" name="semester" type="select" value={form.semester} onChange={handleChange} options={['1','2','3','4','5','6','7','8']} />
                            <Input label="Division" name="division" type="select" value={form.division} onChange={handleChange} options={['D1','D2','D3','D4']} />
                            <Input label="Batch" name="batch" value={form.batch} onChange={handleChange} placeholder="e.g., B1" />
                            <Input label="CGPA" name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="e.g., 8.5" />
                        </div>
                    </div>

                    <div className={styles.editCard}>
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>interests</span>
                            Skills & Activities
                        </h4>
                        <div className={styles.formGrid}>
                            <Input label="Skills" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python..." icon="code" />
                            <Input label="Clubs" name="clubs" value={form.clubs} onChange={handleChange} placeholder="Coding Club, IEEE..." icon="groups" />
                        </div>
                    </div>

                    <div className={styles.editCard}>
                        <div className={styles.sectionTitleRow}>
                            <h4 className={styles.sectionTitle}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
                                Address
                            </h4>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon="my_location"
                                onClick={handleUseLocation}
                                loading={geoLoading}
                            >
                                Use Current Location
                            </Button>
                        </div>
                        <div className={styles.formGrid}>
                            <Input label="City" name="city" value={form.city} onChange={handleChange} icon="location_city" />
                            <Input label="State" name="state" value={form.state} onChange={handleChange} />
                            <div className={styles.fullWidth}>
                                <Input label="Full Address" name="fullAddress" value={form.fullAddress} onChange={handleChange} icon="home" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.editActions}>
                        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave} loading={loading}>Save Changes</Button>
                    </div>
                </motion.div>
            ) : (
                /* ─── View Mode ─── */
                <div className={styles.infoGrid}>
                    <motion.div
                        className={styles.infoCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                            Personal Information
                        </h4>
                        {infoItem('mail', 'Email', user?.email)}
                        {infoItem('phone', 'Phone', user?.phone)}
                        {infoItem('wc', 'Gender', user?.gender)}
                    </motion.div>

                    <motion.div
                        className={styles.infoCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>school</span>
                            Academic Information
                        </h4>
                        {infoItem('apartment', 'Department', user?.department)}
                        {infoItem('calendar_month', 'Semester', user?.semester)}
                        {infoItem('groups', 'Division', user?.division)}
                        {infoItem('tag', 'Batch', user?.batch)}
                        {infoItem('grade', 'CGPA', user?.cgpa)}
                    </motion.div>

                    <motion.div
                        className={styles.infoCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>interests</span>
                            Skills & Activities
                        </h4>
                        <div className={styles.tagSection}>
                            <span className={styles.tagLabel}>Skills</span>
                            <div className={styles.tags}>
                                {user?.skills?.length > 0 ? user.skills.map(s => (
                                    <span key={s} className={styles.tag}>{s}</span>
                                )) : <span className={styles.emptyTag}>No skills added</span>}
                            </div>
                        </div>
                        <div className={styles.tagSection}>
                            <span className={styles.tagLabel}>Clubs</span>
                            <div className={styles.tags}>
                                {user?.clubs?.length > 0 ? user.clubs.map(c => (
                                    <span key={c} className={`${styles.tag} ${styles.tagClub}`}>{c}</span>
                                )) : <span className={styles.emptyTag}>No clubs joined</span>}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.infoCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
                            Address
                        </h4>
                        {infoItem('location_city', 'City', user?.address?.city)}
                        {infoItem('map', 'State', user?.address?.state)}
                        {infoItem('home', 'Full Address', user?.address?.fullAddress)}
                        {infoItem(
                            'my_location',
                            'Coordinates',
                            user?.address?.latitude != null && user?.address?.longitude != null
                                ? `${user.address.latitude.toFixed?.(5) ?? user.address.latitude}, ${user.address.longitude.toFixed?.(5) ?? user.address.longitude}`
                                : null
                        )}
                    </motion.div>
                </div>
            )}
        </PageTransition>
    )
}
