import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import Button from '../../components/common/Button/Button'
import { useToast } from '../../components/common/Toast/Toast'
import { updateSetting, resetSettings } from '../../store/settingsSlice'
import { useAttendance } from '../../hooks/useAttendance'
import { useTheme } from '../../hooks/useTheme'
import styles from './SettingsPage.module.css'

// ──────────────────────────────────────────────
// Settings Page
// User-configurable preferences with live preview
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

export default function SettingsPage() {
    const dispatch = useDispatch()
    const { addToast } = useToast()
    const settings = useSelector(state => state.settings)
    const { theme, setTheme } = useTheme()
    const { getSummary } = useAttendance()
    const [semesterDate, setSemesterDate] = useState('')

    const handleSettingChange = useCallback((key, value) => {
        dispatch(updateSetting({ key, value }))
        addToast({ type: 'success', message: 'Setting updated' })
    }, [dispatch, addToast])

    const handleThemeChange = useCallback((newTheme) => {
        setTheme(newTheme)
        addToast({ type: 'success', message: `Theme set to ${newTheme}` })
    }, [setTheme, addToast])

    const handleSetSemesterDate = useCallback(async () => {
        if (!semesterDate) return
        try {
            const { attendanceAPI } = await import('../../api/attendance.api')
            await attendanceAPI.setSemesterStart(semesterDate)
            getSummary()
            addToast({ type: 'success', message: 'Semester start date updated' })
        } catch {
            addToast({ type: 'error', message: 'Failed to update semester start date' })
        }
    }, [semesterDate, getSummary, addToast])

    const handleReset = useCallback(() => {
        dispatch(resetSettings())
        addToast({ type: 'info', message: 'Settings reset to defaults' })
    }, [dispatch, addToast])

    const sectionVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    }

    return (
        <PageTransition className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>Settings</h2>
                    <p>Customize your Campus Companion experience</p>
                </div>
            </div>

            <div className={styles.settingsGrid}>
                {/* ─── Appearance ─── */}
                <motion.div
                    className={styles.settingsCard}
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0 }}
                >
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.cardIcon}`}>palette</span>
                        <h3>Appearance</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Theme</span>
                                <span className={styles.settingDesc}>Choose your preferred color scheme</span>
                            </div>
                            <div className={styles.themePills}>
                                {['light', 'dark', 'system'].map(t => (
                                    <button
                                        key={t}
                                        className={`${styles.themePill} ${theme === t ? styles.themePillActive : ''}`}
                                        onClick={() => handleThemeChange(t)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                            {t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'contrast'}
                                        </span>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Attendance Target ─── */}
                <motion.div
                    className={styles.settingsCard}
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.cardIcon}`}>target</span>
                        <h3>Attendance Target</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Target Percentage</span>
                                <span className={styles.settingDesc}>Minimum attendance goal for all subjects</span>
                            </div>
                            <div className={styles.rangeGroup}>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    value={settings.attendanceTarget}
                                    onChange={(e) => handleSettingChange('attendanceTarget', parseInt(e.target.value))}
                                    className={styles.rangeSlider}
                                />
                                <span className={styles.rangeValue}>{settings.attendanceTarget}%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Academic Info ─── */}
                <motion.div
                    className={styles.settingsCard}
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.cardIcon}`}>school</span>
                        <h3>Academic</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Semester Start Date</span>
                                <span className={styles.settingDesc}>When your current semester started</span>
                            </div>
                            <div className={styles.dateGroup}>
                                <input
                                    type="date"
                                    value={semesterDate}
                                    onChange={(e) => setSemesterDate(e.target.value)}
                                    className={styles.dateInput}
                                />
                                <Button size="sm" onClick={handleSetSemesterDate} disabled={!semesterDate}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Notifications ─── */}
                <motion.div
                    className={styles.settingsCard}
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.3 }}
                >
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.cardIcon}`}>notifications</span>
                        <h3>Notifications</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Daily Reminder</span>
                                <span className={styles.settingDesc}>Get reminded to mark attendance</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={settings.dailyReminder}
                                    onChange={(e) => handleSettingChange('dailyReminder', e.target.checked)}
                                />
                                <span className={styles.switchSlider} />
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Low Attendance Alert</span>
                                <span className={styles.settingDesc}>Alert when any subject drops below target</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={settings.lowAttendanceAlert}
                                    onChange={(e) => handleSettingChange('lowAttendanceAlert', e.target.checked)}
                                />
                                <span className={styles.switchSlider} />
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Holiday Notifications</span>
                                <span className={styles.settingDesc}>Get notified about upcoming holidays</span>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={settings.holidayNotifications}
                                    onChange={(e) => handleSettingChange('holidayNotifications', e.target.checked)}
                                />
                                <span className={styles.switchSlider} />
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Reminder Time</span>
                                <span className={styles.settingDesc}>When to send daily reminders</span>
                            </div>
                            <input
                                type="time"
                                value={settings.reminderTime}
                                onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                                className={styles.timeInput}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* ─── Data Management ─── */}
                <motion.div
                    className={styles.settingsCard}
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4 }}
                >
                    <div className={styles.cardHeader}>
                        <span className={`material-symbols-outlined ${styles.cardIcon}`}>database</span>
                        <h3>Data</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.settingRow}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>Reset Settings</span>
                                <span className={styles.settingDesc}>Restore all settings to default values</span>
                            </div>
                            <Button variant="secondary" size="sm" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    )
}
