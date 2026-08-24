import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import Loader from '../Loader/Loader'
import { useToast } from '../Toast/Toast'
import { fetchSubjectHistory, clearSubjectHistory, toggleAttendanceThunk, addAdjustmentThunk } from '../../../store/attendanceSlice'
import styles from './SubjectDetailModal.module.css'

// ──────────────────────────────────────────────
// Subject Detail Modal
// Shows date-wise attendance for a specific subject
// Allows toggling present/absent and viewing summary
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const SUBJECT_COLORS = {
    DAA: 'var(--subject-daa)',
    CN: 'var(--subject-cn)',
    FSD: 'var(--subject-fsd)',
    MI: 'var(--subject-mi)',
    DAV: 'var(--subject-dav)',
    ML: 'var(--subject-ml)'
}

export default function SubjectDetailModal({ isOpen, onClose, subject }) {
    const dispatch = useDispatch()
    const { addToast } = useToast()
    const { subjectHistory, subjectHistoryLoading } = useSelector(state => state.attendance)
    const [filter, setFilter] = useState('all') // 'all', 'present', 'absent'
    const [lectureDate, setLectureDate] = useState(() => new Date().toISOString().split('T')[0])
    const [lectureType, setLectureType] = useState('theory')
    const [lectureDelta, setLectureDelta] = useState(1)
    const [lectureReason, setLectureReason] = useState('')
    const [lectureSaving, setLectureSaving] = useState(false)

    useEffect(() => {
        if (isOpen && subject) {
            dispatch(fetchSubjectHistory(subject))
        }
        return () => {
            if (!isOpen) dispatch(clearSubjectHistory())
        }
    }, [isOpen, subject, dispatch])

    const handleToggle = useCallback(async (date, type, currentIsPresent) => {
        const newIsPresent = currentIsPresent === null ? true : !currentIsPresent
        const result = await dispatch(toggleAttendanceThunk({ date, subject, type, isPresent: newIsPresent }))
        if (result.meta.requestStatus === 'fulfilled') {
            // Refresh the subject history
            dispatch(fetchSubjectHistory(subject))
            addToast({
                type: 'success',
                message: `Marked ${newIsPresent ? 'present' : 'absent'} for ${date}`
            })
        }
    }, [subject, dispatch, addToast])

    const handleLectureAdjust = useCallback(async () => {
        if (!subject || !lectureDate) return
        setLectureSaving(true)
        const result = await dispatch(addAdjustmentThunk({
            date: lectureDate,
            subject,
            type: lectureType,
            adjustment: lectureDelta,
            reason: lectureReason || (lectureDelta > 0 ? 'Extra lecture' : 'Cancelled lecture')
        }))
        setLectureSaving(false)
        if (result.meta.requestStatus === 'fulfilled') {
            dispatch(fetchSubjectHistory(subject))
            addToast({
                type: 'success',
                message: `${lectureDelta > 0 ? 'Added extra' : 'Removed'} ${subject} ${lectureType} lecture on ${lectureDate}`
            })
            setLectureReason('')
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to update lectures' })
        }
    }, [subject, lectureDate, lectureType, lectureDelta, lectureReason, dispatch, addToast])

    const handleClose = useCallback(() => {
        dispatch(clearSubjectHistory())
        onClose()
    }, [dispatch, onClose])

    const subjectColor = SUBJECT_COLORS[subject] || 'var(--accent-primary)'

    // Filter history records
    const filteredHistory = subjectHistory?.history?.filter(record => {
        if (filter === 'present') return record.isPresent === true
        if (filter === 'absent') return record.isPresent === false
        return true
    }) || []

    const summary = subjectHistory?.summary

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={
            <span className={styles.modalTitle}>
                <span className={styles.subjectDot} style={{ background: subjectColor }} />
                {subject} — Attendance History
            </span>
        }>
            {subjectHistoryLoading ? (
                <Loader text="Loading history..." />
            ) : subjectHistory ? (
                <div className={styles.content}>
                    {/* Summary Cards */}
                    <div className={styles.summaryRow}>
                        <div className={styles.summaryCard}>
                            <span className={styles.summaryValue}>{summary?.overall?.attended || 0}</span>
                            <span className={styles.summaryLabel}>Attended</span>
                        </div>
                        <div className={styles.summaryCard}>
                            <span className={styles.summaryValue}>{summary?.overall?.total || 0}</span>
                            <span className={styles.summaryLabel}>Total</span>
                        </div>
                        <div className={`${styles.summaryCard} ${styles.summaryCardAccent}`}>
                            <span className={styles.summaryValue} style={{ color: subjectColor }}>
                                {summary?.overall?.percentage || 0}%
                            </span>
                            <span className={styles.summaryLabel}>Percentage</span>
                        </div>
                    </div>

                    {/* Type Breakdown */}
                    <div className={styles.typeBreakdown}>
                        <div className={styles.typeItem}>
                            <span className={styles.typeLabel}>Theory</span>
                            <span className={styles.typeValue}>
                                {summary?.theory?.attended || 0}/{summary?.theory?.total || 0}
                                <small> ({summary?.theory?.percentage || 0}%)</small>
                            </span>
                        </div>
                        <div className={styles.typeItem}>
                            <span className={styles.typeLabel}>Lab</span>
                            <span className={styles.typeValue}>
                                {summary?.lab?.attended || 0}/{summary?.lab?.total || 0}
                                <small> ({summary?.lab?.percentage || 0}%)</small>
                            </span>
                        </div>
                    </div>

                    {/* Add / Remove Lecture */}
                    <div className={styles.lectureAdjust}>
                        <div className={styles.lectureAdjustHeader}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
                            Add / Remove Lecture
                        </div>
                        <div className={styles.lectureAdjustRow}>
                            <input
                                type="date"
                                value={lectureDate}
                                onChange={(e) => setLectureDate(e.target.value)}
                                className={styles.lectureInput}
                            />
                            <select
                                value={lectureType}
                                onChange={(e) => setLectureType(e.target.value)}
                                className={styles.lectureInput}
                            >
                                <option value="theory">Theory</option>
                                <option value="lab">Lab</option>
                            </select>
                            <div className={styles.lectureDelta}>
                                <button
                                    type="button"
                                    className={`${styles.lectureDeltaBtn} ${lectureDelta === 1 ? styles.lectureDeltaActive : ''}`}
                                    onClick={() => setLectureDelta(1)}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                                    Extra
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.lectureDeltaBtn} ${lectureDelta === -1 ? styles.lectureDeltaActive : ''}`}
                                    onClick={() => setLectureDelta(-1)}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className={styles.lectureAdjustRow}>
                            <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={lectureReason}
                                onChange={(e) => setLectureReason(e.target.value)}
                                className={styles.lectureInput}
                            />
                            <Button size="sm" onClick={handleLectureAdjust} loading={lectureSaving}>
                                Save
                            </Button>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>Filter:</span>
                        {['all', 'present', 'absent'].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                        <span className={styles.filterCount}>{filteredHistory.length} records</span>
                    </div>

                    {/* History List */}
                    <div className={styles.historyList}>
                        <AnimatePresence>
                            {filteredHistory.length > 0 ? filteredHistory.map((record, i) => (
                                <motion.div
                                    key={record._id}
                                    className={styles.historyItem}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                >
                                    <div className={styles.historyDate}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                                        {new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                    <span className={styles.historyType}>{record.type}</span>
                                    <div className={styles.historyStatus}>
                                        <span className={`${styles.statusBadge} ${
                                            record.isPresent ? styles.statusPresent : styles.statusAbsent
                                        }`}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                                {record.isPresent ? 'check_circle' : 'cancel'}
                                            </span>
                                            {record.isPresent ? 'Present' : 'Absent'}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.toggleBtn}
                                        onClick={() => handleToggle(record.date, record.type, record.isPresent)}
                                        title="Toggle status"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
                                    </button>
                                </motion.div>
                            )) : (
                                <div className={styles.emptyState}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--text-tertiary)' }}>
                                        event_busy
                                    </span>
                                    <p>No records found</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>No data available</p>
                </div>
            )}
        </Modal>
    )
}
