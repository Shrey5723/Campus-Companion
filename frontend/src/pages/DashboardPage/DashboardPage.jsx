import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import ProgressRing from '../../components/common/ProgressRing/ProgressRing'
import Button from '../../components/common/Button/Button'
import Loader from '../../components/common/Loader/Loader'
import SubjectDetailModal from '../../components/common/SubjectDetailModal/SubjectDetailModal'
import { useAttendance } from '../../hooks/useAttendance'
import { useHolidays } from '../../hooks/useHolidays'
import styles from './DashboardPage.module.css'

// ──────────────────────────────────────────────
// Dashboard Page
// Overview: Overall stats + per-subject cards
// Draggable subject cards (HTML5 Drag & Drop API)
// Clickable cards → subject detail modal
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const SUBJECT_FULL_NAMES = {
    DAA: 'Design & Analysis of Algorithms',
    CN: 'Computer Networks',
    FSD: 'Full Stack Development',
    MI: 'Machine Intelligence',
    DAV: 'Data Analytics & Visualization',
    ML: 'Machine Learning'
}

function getBarColor(percentage) {
    if (percentage >= 75) return 'var(--success)'
    if (percentage >= 60) return 'var(--warning)'
    return 'var(--danger)'
}

function loadSubjectOrder() {
    try {
        const saved = localStorage.getItem('cc_subject_order')
        return saved ? JSON.parse(saved) : null
    } catch {
        return null
    }
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { summary, loading, error, getSummary } = useAttendance()
    const { holidays, getHolidays } = useHolidays()
    const settings = useSelector(state => state.settings)

    // Subject detail modal state
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Drag & Drop state
    const [subjectOrder, setSubjectOrder] = useState(loadSubjectOrder)
    const [dragOverIndex, setDragOverIndex] = useState(null)

    useEffect(() => {
        getSummary()
        getHolidays()
    }, [getSummary, getHolidays])

    // Re-fetch summary when it becomes null (invalidated by toggle/bulk/adjust)
    useEffect(() => {
        if (!summary && !loading && !error) {
            getSummary()
        }
    }, [summary, loading, error, getSummary])

    const handleSubjectClick = useCallback((subject) => {
        setSelectedSubject(subject)
        setIsModalOpen(true)
    }, [])

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false)
        setSelectedSubject(null)
        // Refresh summary since user may have toggled attendance in modal
        getSummary()
    }, [getSummary])

    // ─── Drag & Drop Handlers (HTML5 API) ───
    const handleDragStart = useCallback((e, index) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
        requestAnimationFrame(() => {
            e.target.style.opacity = '0.5'
        })
    }, [])

    const handleDragEnd = useCallback((e) => {
        e.target.style.opacity = '1'
        setDragOverIndex(null)
    }, [])

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(index)
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null)
    }, [])

    const handleDrop = useCallback((e, dropIndex) => {
        e.preventDefault()
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
        if (fromIndex === dropIndex) return

        setSubjectOrder(prevOrder => {
            const currentSubjects = summary ? Object.keys(summary) : []
            const ordered = prevOrder || currentSubjects
            const newOrder = [...ordered]
            const [moved] = newOrder.splice(fromIndex, 1)
            newOrder.splice(dropIndex, 0, moved)
            localStorage.setItem('cc_subject_order', JSON.stringify(newOrder))
            return newOrder
        })

        setDragOverIndex(null)
    }, [summary])

    if (loading && !summary) {
        return <Loader text="Loading attendance data..." />
    }

    // Calculate overall stats from summary
    const allSubjects = summary ? Object.keys(summary) : []
    // Apply custom order if set
    const subjects = subjectOrder
        ? subjectOrder.filter(s => allSubjects.includes(s))
        : allSubjects
    // Add any new subjects not in saved order
    const missingSubjects = allSubjects.filter(s => !subjects.includes(s))
    const orderedSubjects = [...subjects, ...missingSubjects]

    const totalAttended = orderedSubjects.reduce((sum, s) => sum + (summary[s]?.overall?.attended || 0), 0)
    const totalClasses = orderedSubjects.reduce((sum, s) => sum + (summary[s]?.overall?.total || 0), 0)
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0

    // Count upcoming holidays (from today onwards)
    const todayStr = new Date().toISOString().split('T')[0]
    const upcomingHolidays = holidays.filter(h => {
        const hDate = h.date?.split('T')[0]
        return hDate >= todayStr
    }).length

    const attendanceTarget = settings?.attendanceTarget || 75
    const subjectsAboveTarget = orderedSubjects.filter(s => (summary[s]?.overall?.percentage || 0) >= attendanceTarget).length

    const stats = [
        {
            label: 'Overall Attendance',
            value: overallPercentage,
            suffix: '%',
            icon: 'percent',
            colorClass: styles.statIconPrimary
        },
        {
            label: 'Classes Attended',
            value: totalAttended,
            suffix: `/${totalClasses}`,
            icon: 'check_circle',
            colorClass: styles.statIconSuccess
        },
        {
            label: 'Holidays',
            value: upcomingHolidays,
            suffix: ` / ${holidays.length} total`,
            icon: 'beach_access',
            colorClass: styles.statIconInfo
        },
        {
            label: `Subjects ≥ ${attendanceTarget}%`,
            value: subjectsAboveTarget,
            suffix: `/${orderedSubjects.length}`,
            icon: 'trending_up',
            colorClass: styles.statIconWarning
        }
    ]

    return (
        <PageTransition className={styles.page}>
            {/* Overall Stats */}
            <div className={styles.statsRow}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className={styles.statCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                        <div className={`${styles.statIconWrapper} ${stat.colorClass}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                                {stat.icon}
                            </span>
                        </div>
                        <div>
                            <div className={styles.statLabel}>{stat.label}</div>
                            <div className={styles.statValue}>
                                {stat.value}
                                <span className={styles.statSuffix}>{stat.suffix}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <Button
                    icon="calendar_month"
                    onClick={() => navigate('/attendance')}
                >
                    Mark Attendance
                </Button>
                <Button
                    variant="secondary"
                    icon="calculate"
                    onClick={() => navigate('/bunk-calculator')}
                >
                    Bunk Calculator
                </Button>
            </div>

            {/* Subject Cards */}
            <div>
                <h2 className={styles.sectionTitle}>Subject-wise Attendance</h2>
                <p className={styles.sectionSub}>
                    Click to view details · Drag to reorder
                </p>
            </div>

            <div className={styles.subjectGrid}>
                {orderedSubjects.map((subject, i) => {
                    const data = summary[subject]
                    const theoryPct = data?.theory?.percentage || 0
                    const labPct = data?.lab?.percentage || 0
                    const overallPct = data?.overall?.percentage || 0

                    return (
                        <motion.div
                            key={subject}
                            className={`${styles.subjectCard} ${styles[`subject${subject}`]} ${
                                dragOverIndex === i ? styles.subjectCardDragOver : ''
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleSubjectClick(subject)}
                            style={{ cursor: 'pointer' }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, i)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, i)}
                        >
                            {/* Drag Handle */}
                            <div className={styles.dragHandle} title="Drag to reorder">
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>drag_indicator</span>
                            </div>
                            <div className={styles.subjectLeft}>
                                <ProgressRing
                                    percentage={overallPct}
                                    size={90}
                                    strokeWidth={7}
                                />
                            </div>
                            <div className={styles.subjectRight}>
                                <div>
                                    <div className={styles.subjectName}>{subject}</div>
                                    <div className={styles.subjectMeta}>
                                        {SUBJECT_FULL_NAMES[subject] || subject}
                                    </div>
                                </div>
                                <div className={styles.attendanceBars}>
                                    {/* Theory Bar */}
                                    <div className={styles.barRow}>
                                        <span className={styles.barLabel}>Theory</span>
                                        <div className={styles.barTrack}>
                                            <motion.div
                                                className={styles.barFill}
                                                style={{ background: getBarColor(theoryPct) }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${theoryPct}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                                            />
                                        </div>
                                        <span className={styles.barValue} style={{ color: getBarColor(theoryPct) }}>
                                            {data?.theory?.attended}/{data?.theory?.total}
                                        </span>
                                    </div>
                                    {/* Lab Bar */}
                                    <div className={styles.barRow}>
                                        <span className={styles.barLabel}>Lab</span>
                                        <div className={styles.barTrack}>
                                            <motion.div
                                                className={styles.barFill}
                                                style={{ background: getBarColor(labPct) }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${labPct}%` }}
                                                transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                                            />
                                        </div>
                                        <span className={styles.barValue} style={{ color: getBarColor(labPct) }}>
                                            {data?.lab?.attended}/{data?.lab?.total}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.overallRow}>
                                    <span className={styles.overallLabel}>Overall</span>
                                    <span className={styles.overallValue} style={{ color: getBarColor(overallPct) }}>
                                        {data?.overall?.attended}/{data?.overall?.total} ({overallPct}%)
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Subject Detail Modal */}
            <SubjectDetailModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                subject={selectedSubject}
            />
        </PageTransition>
    )
}
