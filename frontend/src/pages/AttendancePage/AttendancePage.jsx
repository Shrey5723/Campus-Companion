import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../../components/common/PageTransition/PageTransition'
import Button from '../../components/common/Button/Button'
import Loader from '../../components/common/Loader/Loader'
import { useAttendance } from '../../hooks/useAttendance'
import { useHolidays } from '../../hooks/useHolidays'
import { useToast } from '../../components/common/Toast/Toast'
import { fetchTodos, toggleComplete, createTodo } from '../../store/todoSlice'
import styles from './AttendancePage.module.css'

// ──────────────────────────────────────────────
// Attendance Page
// Calendar + Day detail panel with toggles,
// holiday management, lecture adjustments,
// and integrated To-Do task deadlines.
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const SUBJECTS = ['DAA', 'CN', 'FSD', 'MI', 'DAV', 'ML']
const LECTURE_TYPES = ['theory', 'lab']
const TASK_CATEGORIES = ['General', 'DAA', 'CN', 'FSD', 'MI', 'DAV', 'ML', 'Assignment', 'Exam', 'Project']

function formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export default function AttendancePage() {
    const dispatch = useDispatch()
    const { addToast } = useToast()
    const {
        dateAttendance, dateLoading,
        adjustments, adjustmentsLoading,
        getByDate, toggle, bulkMark, getSummary,
        getAdjustments, addAdjustment, removeAdjustment
    } = useAttendance()
    const {
        holidays, loading: holidaysLoading,
        getHolidays, addHoliday, removeHoliday
    } = useHolidays()

    const { todos, loading: todosLoading } = useSelector(state => state.todos)

    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [selectedDate, setSelectedDate] = useState(formatDate(today))

    // Holiday form state
    const [holidayReason, setHolidayReason] = useState('')

    // Lecture adjustment form state
    const [showAdjustForm, setShowAdjustForm] = useState(false)
    const [adjSubject, setAdjSubject] = useState(SUBJECTS[0])
    const [adjType, setAdjType] = useState('theory')
    const [adjValue, setAdjValue] = useState(1)
    const [adjReason, setAdjReason] = useState('')

    // Quick Task form state
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [taskTitle, setTaskTitle] = useState('')
    const [taskCategory, setTaskCategory] = useState('General')
    const [taskPriority, setTaskPriority] = useState('medium')
    const [taskDueTime, setTaskDueTime] = useState('')
    const [taskSaving, setTaskSaving] = useState(false)

    // Management section toggle
    const [showManager, setShowManager] = useState(false)

    useEffect(() => {
        getByDate(selectedDate)
    }, [selectedDate, getByDate])

    useEffect(() => {
        getHolidays()
        getAdjustments()
        dispatch(fetchTodos())
    }, [getHolidays, getAdjustments, dispatch])

    // Group todos by dueDate (YYYY-MM-DD)
    const todosByDate = useMemo(() => {
        const map = {}
        if (Array.isArray(todos)) {
            todos.forEach(t => {
                if (t.dueDate) {
                    const dStr = t.dueDate.split('T')[0]
                    if (!map[dStr]) map[dStr] = []
                    map[dStr].push(t)
                }
            })
        }
        return map
    }, [todos])

    // Tasks due on the currently selected date
    const selectedDayTasks = useMemo(() => {
        return todosByDate[selectedDate] || []
    }, [todosByDate, selectedDate])

    // Calendar helpers
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    // Build holiday date set for calendar badges
    const holidaySet = new Set(
        holidays.map(h => h.date?.split('T')[0])
    )

    // Build adjustment date set for calendar badges
    const adjustmentDateSet = new Set(
        adjustments.map(a => a.date?.split('T')[0])
    )

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const handleDayClick = (day) => {
        const date = new Date(currentYear, currentMonth, day)
        setSelectedDate(formatDate(date))
    }

    const isToday = (day) => {
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
    }

    const isSelected = (day) => {
        const d = new Date(currentYear, currentMonth, day)
        return formatDate(d) === selectedDate
    }

    // ─── Toggle Attendance ───
    const handleToggle = useCallback(async (subject, type, currentIsPresent) => {
        const newIsPresent = currentIsPresent === null ? true : !currentIsPresent
        const result = await toggle(selectedDate, subject, type, newIsPresent)
        if (result.meta.requestStatus === 'fulfilled') {
            addToast({
                type: 'success',
                message: `${subject} (${type}) marked as ${newIsPresent ? 'present' : 'absent'}`
            })
        }
    }, [selectedDate, toggle, addToast])

    const handleMarkAllPresent = useCallback(async () => {
        if (!dateAttendance?.records?.length) return
        const records = dateAttendance.records.map(r => ({
            subject: r.subject,
            type: r.type,
            isPresent: true
        }))
        const result = await bulkMark(selectedDate, records)
        if (result.meta.requestStatus === 'fulfilled') {
            getByDate(selectedDate)
            getSummary()
            addToast({ type: 'success', message: 'All subjects marked present!' })
        }
    }, [dateAttendance, selectedDate, bulkMark, getByDate, getSummary, addToast])

    const handleMarkAllAbsent = useCallback(async () => {
        if (!dateAttendance?.records?.length) return
        const records = dateAttendance.records.map(r => ({
            subject: r.subject,
            type: r.type,
            isPresent: false
        }))
        const result = await bulkMark(selectedDate, records)
        if (result.meta.requestStatus === 'fulfilled') {
            getByDate(selectedDate)
            getSummary()
            addToast({ type: 'info', message: 'All subjects marked absent' })
        }
    }, [dateAttendance, selectedDate, bulkMark, getByDate, getSummary, addToast])

    // ─── Holiday Actions ───
    const handleAddHoliday = useCallback(async () => {
        const result = await addHoliday(selectedDate, holidayReason)
        if (result.meta.requestStatus === 'fulfilled') {
            setHolidayReason('')
            getByDate(selectedDate)
            getSummary()
            addToast({ type: 'success', message: 'Day marked as holiday' })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to add holiday' })
        }
    }, [selectedDate, holidayReason, addHoliday, getByDate, getSummary, addToast])

    const handleRemoveHoliday = useCallback(async () => {
        const result = await removeHoliday(selectedDate)
        if (result.meta.requestStatus === 'fulfilled') {
            getByDate(selectedDate)
            getSummary()
            addToast({ type: 'info', message: 'Holiday removed' })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to remove holiday' })
        }
    }, [selectedDate, removeHoliday, getByDate, getSummary, addToast])

    // ─── Lecture Adjustment Actions ───
    const handleAddAdjustment = useCallback(async () => {
        const result = await addAdjustment(selectedDate, adjSubject, adjType, adjValue, adjReason)
        if (result.meta.requestStatus === 'fulfilled') {
            setAdjReason('')
            setShowAdjustForm(false)
            getByDate(selectedDate)
            getSummary()
            addToast({
                type: 'success',
                message: `${adjValue > 0 ? 'Extra' : 'Cancelled'} ${adjSubject} ${adjType} lecture recorded`
            })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to add adjustment' })
        }
    }, [selectedDate, adjSubject, adjType, adjValue, adjReason, addAdjustment, getByDate, getSummary, addToast])

    const handleRemoveAdjustment = useCallback(async (date, subject, type) => {
        const result = await removeAdjustment(date, subject, type)
        if (result.meta.requestStatus === 'fulfilled') {
            getByDate(selectedDate)
            getSummary()
            addToast({ type: 'info', message: 'Lecture adjustment removed' })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to remove adjustment' })
        }
    }, [removeAdjustment, getByDate, selectedDate, getSummary, addToast])

    // ─── Task Actions ───
    const handleToggleTask = useCallback(async (taskId) => {
        const result = await dispatch(toggleComplete(taskId))
        if (result.meta.requestStatus === 'fulfilled') {
            const isCompleted = result.payload.status === 'completed'
            addToast({
                type: 'success',
                message: `Task ${isCompleted ? 'completed!' : 'marked pending'}`
            })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to update task' })
        }
    }, [dispatch, addToast])

    const handleQuickAddTask = useCallback(async (e) => {
        e?.preventDefault()
        if (!taskTitle.trim()) return

        setTaskSaving(true)
        const result = await dispatch(createTodo({
            title: taskTitle.trim(),
            dueDate: selectedDate,
            category: taskCategory,
            priority: taskPriority,
            dueTime: taskDueTime || null
        }))
        setTaskSaving(false)

        if (result.meta.requestStatus === 'fulfilled') {
            setTaskTitle('')
            setTaskDueTime('')
            setShowTaskForm(false)
            addToast({ type: 'success', message: 'Task added for ' + selectedDate })
        } else {
            addToast({ type: 'error', message: result.payload || 'Failed to add task' })
        }
    }, [dispatch, taskTitle, selectedDate, taskCategory, taskPriority, taskDueTime, addToast])

    // ─── Status Icons/Text ───
    const getStatusIcon = (isPresent) => {
        if (isPresent === true) return <span className={`material-symbols-outlined ${styles.toggleLabelPresent}`} style={{ fontSize: 18 }}>check_circle</span>
        if (isPresent === false) return <span className={`material-symbols-outlined ${styles.toggleLabelAbsent}`} style={{ fontSize: 18 }}>cancel</span>
        return <span className={`material-symbols-outlined ${styles.toggleLabelNull}`} style={{ fontSize: 18 }}>remove_circle</span>
    }

    const getStatusText = (isPresent) => {
        if (isPresent === true) return <span className={`${styles.toggleLabel} ${styles.toggleLabelPresent}`}>Present</span>
        if (isPresent === false) return <span className={`${styles.toggleLabel} ${styles.toggleLabelAbsent}`}>Absent</span>
        return <span className={`${styles.toggleLabel} ${styles.toggleLabelNull}`}>Not marked</span>
    }

    // ─── Calendar Render ───
    const renderCalendar = () => {
        const cells = []

        // Empty cells before first day
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.calendarDayEmpty}`} />)
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day)
            const dayOfWeek = date.getDay()
            const isWeekend = dayOfWeek === 0
            const dateStr = formatDate(date)
            const isHolidayDay = holidaySet.has(dateStr)
            const hasAdjustment = adjustmentDateSet.has(dateStr)
            const dayTasks = todosByDate[dateStr] || []
            const hasTasks = dayTasks.length > 0
            const pendingTasks = dayTasks.filter(t => t.status !== 'completed')

            cells.push(
                <button
                    key={day}
                    className={`
                        ${styles.calendarDay}
                        ${isToday(day) ? styles.calendarDayToday : ''}
                        ${isSelected(day) ? styles.calendarDaySelected : ''}
                        ${isWeekend ? styles.calendarDayWeekend : ''}
                        ${isHolidayDay ? styles.calendarDayHoliday : ''}
                    `}
                    onClick={() => handleDayClick(day)}
                >
                    {day}
                    {/* Badge indicators */}
                    <div className={styles.dayBadges}>
                        {isHolidayDay && <span className={styles.dayBadgeHoliday} title="Holiday">🏖</span>}
                        {hasAdjustment && <span className={styles.dayBadgeAdjust} title="Lecture adjustment">⚡</span>}
                        {hasTasks && (
                            <span
                                className={`${styles.dayBadgeTask} ${pendingTasks.length > 0 ? styles.dayBadgeTaskPending : styles.dayBadgeTaskCompleted}`}
                                title={`${dayTasks.length} task${dayTasks.length > 1 ? 's' : ''} (${pendingTasks.length} pending)`}
                            >
                                📋{dayTasks.length}
                            </span>
                        )}
                    </div>
                </button>
            )
        }

        return cells
    }

    // ─── Day Detail: Holiday Controls ───
    const renderHolidayControls = () => {
        const isHolidayDate = dateAttendance?.isHoliday

        if (isHolidayDate) {
            return (
                <motion.div
                    className={styles.holidayBanner}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.holidayBannerContent}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>beach_access</span>
                        <span>{dateAttendance.message || 'This day is marked as holiday'}</span>
                    </div>
                    <Button size="sm" variant="secondary" onClick={handleRemoveHoliday}>
                        Remove Holiday
                    </Button>
                </motion.div>
            )
        }

        return (
            <div className={styles.holidayAction}>
                <div className={styles.holidayInputRow}>
                    <input
                        type="text"
                        placeholder="Reason (optional)"
                        value={holidayReason}
                        onChange={(e) => setHolidayReason(e.target.value)}
                        className={styles.holidayInput}
                    />
                    <Button size="sm" variant="secondary" onClick={handleAddHoliday} icon="beach_access">
                        Mark Holiday
                    </Button>
                </div>
            </div>
        )
    }

    // ─── Day Detail: Adjustment Controls ───
    const renderAdjustmentControls = () => {
        if (dateAttendance?.isHoliday) return null

        const dateAdjustments = dateAttendance?.adjustments || []

        return (
            <div className={styles.adjustSection}>
                {/* Show existing adjustments for this date */}
                {dateAdjustments.length > 0 && (
                    <div className={styles.adjustList}>
                        {dateAdjustments.map((adj, i) => (
                            <motion.div
                                key={`${adj.subject}-${adj.type}`}
                                className={styles.adjustItem}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className={styles.adjustItemInfo}>
                                    <span className={`${styles.adjustBadge} ${adj.adjustment > 0 ? styles.adjustBadgePlus : styles.adjustBadgeMinus}`}>
                                        {adj.adjustment > 0 ? '+1' : '-1'}
                                    </span>
                                    <span className={styles.adjustItemSubject}>{adj.subject}</span>
                                    <span className={styles.adjustItemType}>{adj.type}</span>
                                    {adj.reason && <span className={styles.adjustItemReason}>— {adj.reason}</span>}
                                </div>
                                <button
                                    className={styles.adjustRemoveBtn}
                                    onClick={() => handleRemoveAdjustment(selectedDate, adj.subject, adj.type)}
                                    title="Remove adjustment"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add adjustment form */}
                <AnimatePresence>
                    {showAdjustForm && (
                        <motion.div
                            className={styles.adjustForm}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.adjustFormRow}>
                                <select
                                    value={adjSubject}
                                    onChange={(e) => setAdjSubject(e.target.value)}
                                    className={styles.adjustSelect}
                                >
                                    {SUBJECTS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <select
                                    value={adjType}
                                    onChange={(e) => setAdjType(e.target.value)}
                                    className={styles.adjustSelect}
                                >
                                    {LECTURE_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <div className={styles.adjustToggle}>
                                    <button
                                        className={`${styles.adjustToggleBtn} ${adjValue === 1 ? styles.adjustToggleBtnActive : ''}`}
                                        onClick={() => setAdjValue(1)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> Extra
                                    </button>
                                    <button
                                        className={`${styles.adjustToggleBtn} ${adjValue === -1 ? styles.adjustToggleBtnActive : ''}`}
                                        onClick={() => setAdjValue(-1)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span> Cancel
                                    </button>
                                </div>
                            </div>
                            <div className={styles.adjustFormRow}>
                                <input
                                    type="text"
                                    placeholder="Reason (optional)"
                                    value={adjReason}
                                    onChange={(e) => setAdjReason(e.target.value)}
                                    className={styles.holidayInput}
                                />
                                <Button size="sm" onClick={handleAddAdjustment}>
                                    Save
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    className={styles.adjustAddBtn}
                    onClick={() => setShowAdjustForm(!showAdjustForm)}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {showAdjustForm ? 'expand_less' : 'add'}
                    </span>
                    {showAdjustForm ? 'Close' : 'Add / Remove Lecture'}
                </button>
            </div>
        )
    }

    // ─── Day Detail: Tasks Section ───
    const renderDayTasks = () => {
        const pendingCount = selectedDayTasks.filter(t => t.status !== 'completed').length

        return (
            <div className={styles.tasksSection}>
                <div className={styles.tasksHeader}>
                    <div className={styles.tasksHeaderLeft}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--accent-primary)' }}>
                            checklist
                        </span>
                        <h4 className={styles.tasksHeaderTitle}>
                            Tasks Due on this Day
                        </h4>
                        <span className={`${styles.tasksBadge} ${pendingCount > 0 ? styles.tasksBadgeActive : ''}`}>
                            {selectedDayTasks.length === 0
                                ? '0'
                                : `${selectedDayTasks.length} (${pendingCount} pending)`}
                        </span>
                    </div>
                    <button
                        className={styles.quickAddBtn}
                        onClick={() => setShowTaskForm(!showTaskForm)}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            {showTaskForm ? 'close' : 'add'}
                        </span>
                        {showTaskForm ? 'Cancel' : 'Add Task'}
                    </button>
                </div>

                {/* Quick Add Task Form */}
                <AnimatePresence>
                    {showTaskForm && (
                        <motion.form
                            className={styles.quickAddForm}
                            onSubmit={handleQuickAddTask}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className={styles.quickAddInput}
                                autoFocus
                            />
                            <div className={styles.quickAddRow}>
                                <select
                                    value={taskCategory}
                                    onChange={(e) => setTaskCategory(e.target.value)}
                                    className={styles.quickAddSelect}
                                >
                                    {TASK_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <select
                                    value={taskPriority}
                                    onChange={(e) => setTaskPriority(e.target.value)}
                                    className={styles.quickAddSelect}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                <input
                                    type="time"
                                    value={taskDueTime}
                                    onChange={(e) => setTaskDueTime(e.target.value)}
                                    className={styles.quickAddTimeInput}
                                    title="Due time (optional)"
                                />
                                <Button size="sm" type="submit" loading={taskSaving}>
                                    Save Task
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Tasks List */}
                {selectedDayTasks.length > 0 ? (
                    <div className={styles.tasksList}>
                        {selectedDayTasks.map((task) => {
                            const isCompleted = task.status === 'completed'
                            const priorityClass = task.priority === 'high'
                                ? styles.taskPriorityHigh
                                : task.priority === 'low'
                                ? styles.taskPriorityLow
                                : styles.taskPriorityMedium

                            return (
                                <motion.div
                                    key={task._id}
                                    className={`${styles.taskItem} ${isCompleted ? styles.taskItemCompleted : ''}`}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                >
                                    <div className={styles.taskItemLeft}>
                                        <button
                                            type="button"
                                            className={`${styles.taskCheckbox} ${isCompleted ? styles.taskCheckboxChecked : ''}`}
                                            onClick={() => handleToggleTask(task._id)}
                                            title={isCompleted ? 'Mark pending' : 'Mark completed'}
                                        >
                                            {isCompleted && (
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                                    check
                                                </span>
                                            )}
                                        </button>
                                        <div className={styles.taskContent}>
                                            <div className={`${styles.taskTitle} ${isCompleted ? styles.taskTitleCompleted : ''}`}>
                                                {task.title}
                                            </div>
                                            <div className={styles.taskMeta}>
                                                <span className={styles.taskCategory}>{task.category || 'General'}</span>
                                                <span className={priorityClass}>
                                                    ● {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                </span>
                                                {task.dueTime && (
                                                    <span className={styles.taskTime}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                                                            schedule
                                                        </span>
                                                        {task.dueTime}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={styles.tasksEmpty}>
                        <span>No tasks scheduled for this date</span>
                        {!showTaskForm && (
                            <button
                                className={styles.quickAddBtn}
                                onClick={() => setShowTaskForm(true)}
                            >
                                + Add Task
                            </button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // ─── Management Section ───
    const renderManagementSection = () => {
        const monthHolidays = holidays.filter(h => {
            const d = new Date(h.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })

        const monthAdjustments = adjustments.filter(a => {
            const d = new Date(a.date)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })

        return (
            <motion.div
                className={styles.manager}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <button
                    className={styles.managerToggle}
                    onClick={() => setShowManager(!showManager)}
                >
                    <div className={styles.managerToggleLeft}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                        <span>Manage Holidays & Adjustments</span>
                        <span className={styles.managerCount}>
                            {holidays.length} holidays · {adjustments.length} adjustments
                        </span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {showManager ? 'expand_less' : 'expand_more'}
                    </span>
                </button>

                <AnimatePresence>
                    {showManager && (
                        <motion.div
                            className={styles.managerContent}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.managerGrid}>
                                {/* Holidays List */}
                                <div className={styles.managerSection}>
                                    <h4 className={styles.managerSectionTitle}>
                                        🏖️ Holidays ({monthHolidays.length} this month)
                                    </h4>
                                    {(holidaysLoading) ? (
                                        <Loader text="Loading..." />
                                    ) : monthHolidays.length > 0 ? (
                                        <div className={styles.managerList}>
                                            {monthHolidays.map(h => (
                                                <div key={h._id} className={styles.managerItem}>
                                                    <div className={styles.managerItemInfo}>
                                                        <span className={styles.managerItemDate}>
                                                            {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        {h.reason && <span className={styles.managerItemReason}>{h.reason}</span>}
                                                    </div>
                                                    <button
                                                        className={styles.adjustRemoveBtn}
                                                        onClick={() => {
                                                            const dateStr = new Date(h.date).toISOString().split('T')[0]
                                                            handleRemoveHolidayFromManager(dateStr)
                                                        }}
                                                        title="Remove"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.managerEmpty}>No holidays this month</p>
                                    )}
                                </div>

                                {/* Adjustments List */}
                                <div className={styles.managerSection}>
                                    <h4 className={styles.managerSectionTitle}>
                                        ⚡ Lecture Adjustments ({monthAdjustments.length} this month)
                                    </h4>
                                    {adjustmentsLoading ? (
                                        <Loader text="Loading..." />
                                    ) : monthAdjustments.length > 0 ? (
                                        <div className={styles.managerList}>
                                            {monthAdjustments.map(a => (
                                                <div key={a._id} className={styles.managerItem}>
                                                    <div className={styles.managerItemInfo}>
                                                        <span className={styles.managerItemDate}>
                                                            {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className={`${styles.adjustBadge} ${a.adjustment > 0 ? styles.adjustBadgePlus : styles.adjustBadgeMinus}`}>
                                                            {a.adjustment > 0 ? '+1' : '-1'}
                                                        </span>
                                                        <span>{a.subject} ({a.type})</span>
                                                        {a.reason && <span className={styles.managerItemReason}>— {a.reason}</span>}
                                                    </div>
                                                    <button
                                                        className={styles.adjustRemoveBtn}
                                                        onClick={() => {
                                                            const dateStr = new Date(a.date).toISOString().split('T')[0]
                                                            handleRemoveAdjustment(dateStr, a.subject, a.type)
                                                        }}
                                                        title="Remove"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.managerEmpty}>No adjustments this month</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    const handleRemoveHolidayFromManager = useCallback(async (dateStr) => {
        const result = await removeHoliday(dateStr)
        if (result.meta.requestStatus === 'fulfilled') {
            if (dateStr === selectedDate) getByDate(selectedDate)
            getSummary()
            addToast({ type: 'info', message: 'Holiday removed' })
        }
    }, [removeHoliday, selectedDate, getByDate, getSummary, addToast])

    return (
        <PageTransition className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h2>Attendance & Schedule</h2>
                    <p>Select a date to mark attendance, manage holidays, and view task deadlines</p>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Calendar */}
                <div className={styles.calendar}>
                    <div className={styles.calendarNav}>
                        <h3 className={styles.calendarMonth}>
                            {MONTHS[currentMonth]} {currentYear}
                        </h3>
                        <div className={styles.calendarNavBtns}>
                            <Button variant="ghost" size="sm" onClick={prevMonth} icon="chevron_left" />
                            <Button variant="ghost" size="sm" onClick={nextMonth} icon="chevron_right" />
                        </div>
                    </div>

                    <div className={styles.calendarGrid}>
                        {DAYS.map(day => (
                            <div key={day} className={styles.calendarDayLabel}>{day}</div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>

                {/* Day Detail Panel */}
                <div className={styles.detailPanel}>
                    <div className={styles.detailHeader}>
                        <h3 className={styles.detailDate}>
                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 8, fontSize: 18 }}>
                                calendar_month
                            </span>
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h3>
                    </div>

                    {dateLoading ? (
                        <Loader text="Loading..." />
                    ) : (
                        <>
                            {/* Attendance / Holiday Section */}
                            {dateAttendance?.isHoliday ? (
                                renderHolidayControls()
                            ) : dateAttendance?.isTeachingDay === false ? (
                                <div className={styles.detailMessage}>
                                    <span className={styles.detailMessageIcon}>📅</span>
                                    {dateAttendance.message || 'No lectures scheduled'}
                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        {renderHolidayControls()}
                                    </div>
                                </div>
                            ) : dateAttendance?.records?.length > 0 ? (
                                <>
                                    {/* Holiday controls at top */}
                                    {renderHolidayControls()}

                                    {/* Subject toggles */}
                                    <div className={styles.subjectList}>
                                        {dateAttendance.records.map((record, i) => (
                                            <motion.div
                                                key={`${record.subject}-${record.type}`}
                                                className={styles.subjectItem}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <div className={styles.subjectItemInfo}>
                                                    <span className={styles.subjectItemName}>
                                                        {record.subject}
                                                    </span>
                                                    <span className={styles.subjectItemType}>
                                                        {record.type}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {getStatusIcon(record.isPresent)}
                                                    {getStatusText(record.isPresent)}
                                                    <button
                                                        className={`${styles.toggle} ${
                                                            record.isPresent === true ? styles.toggleOn :
                                                            record.isPresent === false ? styles.toggleOff :
                                                            styles.toggleNull
                                                        }`}
                                                        onClick={() => handleToggle(record.subject, record.type, record.isPresent)}
                                                        aria-label={`Toggle ${record.subject} ${record.type}`}
                                                    >
                                                        <span className={styles.toggleDot} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Bulk actions */}
                                    <div className={styles.bulkActions}>
                                        <Button size="sm" onClick={handleMarkAllPresent}>
                                            Mark All Present
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={handleMarkAllAbsent}>
                                            Mark All Absent
                                        </Button>
                                    </div>

                                    {/* Lecture Adjustment controls */}
                                    {renderAdjustmentControls()}
                                </>
                            ) : (
                                <div className={styles.detailMessage}>
                                    <span className={styles.detailMessageIcon}>📝</span>
                                    No lectures scheduled for this date
                                    <div style={{ marginTop: 'var(--space-4)' }}>
                                        {renderHolidayControls()}
                                    </div>
                                </div>
                            )}

                            {/* Tasks Due on Selected Date */}
                            {renderDayTasks()}
                        </>
                    )}
                </div>
            </div>

            {/* Management Section */}
            {renderManagementSection()}
        </PageTransition>
    )
}
