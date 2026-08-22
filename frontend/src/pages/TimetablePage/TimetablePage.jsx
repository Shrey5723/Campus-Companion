import { useEffect } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import Loader from '../../components/common/Loader/Loader'
import { useTimetable } from '../../hooks/useTimetable'
import styles from './TimetablePage.module.css'

// ──────────────────────────────────────────────
// Timetable Page
// Weekly grid showing theory + lab subjects
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const DAY_LABELS = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
}

const SUBJECT_COLORS = {
    DAA: 'var(--subject-daa)',
    CN: 'var(--subject-cn)',
    FSD: 'var(--subject-fsd)',
    MI: 'var(--subject-mi)',
    DAV: 'var(--subject-dav)',
    ML: 'var(--subject-ml)'
}

export default function TimetablePage() {
    const { timetable, division, loading, getTimetable } = useTimetable()

    useEffect(() => {
        getTimetable()
    }, [getTimetable])

    if (loading && !timetable) {
        return <Loader text="Loading timetable..." />
    }

    const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]

    const days = timetable ? Object.keys(timetable) : []

    return (
        <PageTransition className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>Weekly Timetable</h2>
                    <p>Your lecture schedule for the current semester</p>
                </div>
                {division && (
                    <div className={styles.divisionBadge}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                        Division {division}
                    </div>
                )}
            </div>

            <motion.div
                className={styles.timetableWrapper}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <table className={styles.timetable}>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Theory</th>
                            <th>Lab</th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day, i) => {
                            const entries = timetable[day] || []
                            const theoryEntries = entries.filter(e => e.type === 'theory')
                            const labEntries = entries.filter(e => e.type === 'lab')
                            const isToday = day === todayName

                            return (
                                <motion.tr
                                    key={day}
                                    className={isToday ? styles.todayRow : ''}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <td className={styles.dayCell}>
                                        {DAY_LABELS[day] || day}
                                        {isToday && <span className={styles.todayBadge}>Today</span>}
                                    </td>
                                    <td>
                                        <div className={styles.subjectPills}>
                                            {theoryEntries.length > 0 ? (
                                                theoryEntries.map((entry, j) => (
                                                    <span key={j} className={`${styles.pill} ${styles.pillTheory}`}>
                                                        <span
                                                            className={styles.pillDot}
                                                            style={{ background: SUBJECT_COLORS[entry.subject] || 'var(--accent-primary)' }}
                                                        />
                                                        {entry.subject}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.noClass}>No theory</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.subjectPills}>
                                            {labEntries.length > 0 ? (
                                                labEntries.map((entry, j) => (
                                                    <span key={j} className={`${styles.pill} ${styles.pillLab}`}>
                                                        <span
                                                            className={styles.pillDot}
                                                            style={{ background: SUBJECT_COLORS[entry.subject] || 'var(--accent-primary)' }}
                                                        />
                                                        {entry.subject} Lab
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={styles.noClass}>No lab</span>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.legendTheory}`} />
                        Theory
                    </div>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.legendLab}`} />
                        Lab
                    </div>
                </div>
            </motion.div>
        </PageTransition>
    )
}
