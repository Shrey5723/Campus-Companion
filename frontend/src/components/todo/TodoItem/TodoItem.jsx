import { useState, useRef, useEffect } from 'react'
import styles from './TodoItem.module.css'

// ──────────────────────────────────────────────
// TodoItem Component
// Individual task card with checkbox, priority badge,
// category tag, due date, reminder, importance, subtasks
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const PRIORITY_LABELS = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
}

export default function TodoItem({
    todo,
    onToggleComplete,
    onToggleImportant,
    onToggleSubtask,
    onEdit,
    onDelete
}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [subtasksOpen, setSubtasksOpen] = useState(false)
    const menuRef = useRef(null)

    const isCompleted = todo.status === 'completed'
    const isOverdue = !isCompleted && todo.dueDate && new Date(todo.dueDate) < new Date(new Date().toDateString())

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [menuOpen])

    // Format due date
    const formatDueDate = (dateStr) => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

        if (taskDate.getTime() === today.getTime()) return 'Today'
        if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow'

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const completedSubtasks = todo.subtasks?.filter(s => s.isCompleted).length || 0
    const totalSubtasks = todo.subtasks?.length || 0

    return (
        <div
            className={`${styles.card} ${isCompleted ? styles.cardCompleted : ''} ${isOverdue ? styles.cardOverdue : ''}`}
        >
            {/* Checkbox */}
            <button
                className={`${styles.checkbox} ${isCompleted ? styles.checkboxChecked : ''}`}
                onClick={() => onToggleComplete(todo._id)}
                aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
                {isCompleted && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* Content */}
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div className={styles.titleArea}>
                        <h4 className={`${styles.title} ${isCompleted ? styles.titleCompleted : ''}`}>
                            {todo.title}
                        </h4>
                        {todo.description && (
                            <p className={styles.description}>{todo.description}</p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        {/* Due Date */}
                        {todo.dueDate && (
                            <span className={`${styles.dueDate} ${isOverdue ? styles.dueDateOverdue : ''}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                                {formatDueDate(todo.dueDate)}
                                {todo.dueTime && ` ${todo.dueTime}`}
                            </span>
                        )}

                        {/* Reminder */}
                        {todo.reminder?.enabled && (
                            <span className={styles.reminderActive} title="Reminder set">
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notifications_active</span>
                            </span>
                        )}

                        {/* Important */}
                        <button
                            className={`${styles.iconBtn} ${todo.isImportant ? styles.importantActive : ''}`}
                            onClick={() => onToggleImportant(todo._id)}
                            title={todo.isImportant ? 'Remove from important' : 'Mark as important'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                {todo.isImportant ? 'star' : 'star'}
                            </span>
                        </button>

                        {/* Menu */}
                        <div className={styles.menuWrapper} ref={menuRef}>
                            <button
                                className={styles.iconBtn}
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>more_horiz</span>
                            </button>
                            {menuOpen && (
                                <div className={styles.menu}>
                                    <button
                                        className={styles.menuItem}
                                        onClick={() => { onEdit(todo); setMenuOpen(false) }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Edit
                                    </button>
                                    <button
                                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                        onClick={() => { onDelete(todo._id); setMenuOpen(false) }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags Row */}
                <div className={styles.tagsRow}>
                    <span className={`${styles.priorityBadge} ${styles[`priority_${todo.priority}`]}`}>
                        {PRIORITY_LABELS[todo.priority]}
                    </span>

                    {todo.category && todo.category !== 'General' && (
                        <span className={styles.categoryBadge}>
                            {todo.category}
                        </span>
                    )}

                    {todo.recurring && todo.recurring !== 'none' && (
                        <span className={styles.recurringBadge}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>repeat</span>
                            {todo.recurring}
                        </span>
                    )}

                    {/* Subtask progress */}
                    {totalSubtasks > 0 && (
                        <button
                            className={styles.subtaskToggle}
                            onClick={() => setSubtasksOpen(!subtasksOpen)}
                        >
                            {completedSubtasks}/{totalSubtasks} subtasks
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                {subtasksOpen ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>
                    )}
                </div>

                {/* Subtasks Expanded */}
                {subtasksOpen && totalSubtasks > 0 && (
                    <div className={styles.subtasksList}>
                        {todo.subtasks.map(subtask => (
                            <div key={subtask._id} className={styles.subtaskItem}>
                                <button
                                    className={`${styles.subtaskCheckbox} ${subtask.isCompleted ? styles.subtaskChecked : ''}`}
                                    onClick={() => onToggleSubtask(todo._id, subtask._id)}
                                >
                                    {subtask.isCompleted && (
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                                <span className={`${styles.subtaskTitle} ${subtask.isCompleted ? styles.subtaskTitleDone : ''}`}>
                                    {subtask.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
