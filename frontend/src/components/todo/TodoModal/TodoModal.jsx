import { useState, useEffect } from 'react'
import styles from './TodoModal.module.css'

// ──────────────────────────────────────────────
// TodoModal Component
// Reusable modal for Add and Edit task flows.
// Props:
//   isOpen, onClose, onSubmit, editingTodo (null = add mode),
//   loading
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const PRIORITY_OPTIONS = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
]

const CATEGORY_OPTIONS = [
    'General', 'FSD', 'DAA', 'CN', 'MI', 'DAV', 'ML', 'Personal', 'Club'
]

const REMINDER_OPTIONS = [
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
]

const RECURRING_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
]

const initialFormState = {
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    dueDate: '',
    dueTime: '',
    reminderEnabled: false,
    reminderBefore: 60,
    subtasks: [],
    recurring: 'none',
    isImportant: false
}

export default function TodoModal({ isOpen, onClose, onSubmit, editingTodo = null, loading = false }) {
    const [form, setForm] = useState(initialFormState)
    const [newSubtask, setNewSubtask] = useState('')

    const isEdit = !!editingTodo

    // Populate form when editing
    useEffect(() => {
        if (editingTodo) {
            setForm({
                title: editingTodo.title || '',
                description: editingTodo.description || '',
                priority: editingTodo.priority || 'medium',
                category: editingTodo.category || 'General',
                dueDate: editingTodo.dueDate
                    ? new Date(editingTodo.dueDate).toISOString().split('T')[0]
                    : '',
                dueTime: editingTodo.dueTime || '',
                reminderEnabled: editingTodo.reminder?.enabled || false,
                reminderBefore: editingTodo.reminder?.beforeMinutes || 60,
                subtasks: editingTodo.subtasks || [],
                recurring: editingTodo.recurring || 'none',
                isImportant: editingTodo.isImportant || false
            })
        } else {
            setForm(initialFormState)
        }
        setNewSubtask('')
    }, [editingTodo, isOpen])

    if (!isOpen) return null

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return
        setForm(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { title: newSubtask.trim(), isCompleted: false }]
        }))
        setNewSubtask('')
    }

    const handleRemoveSubtask = (index) => {
        setForm(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }))
    }

    const handleSubtaskKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddSubtask()
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title.trim()) return

        const data = {
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            category: form.category,
            dueDate: form.dueDate || null,
            dueTime: form.dueTime || null,
            reminder: {
                enabled: form.reminderEnabled,
                beforeMinutes: form.reminderBefore
            },
            subtasks: form.subtasks,
            recurring: form.recurring,
            isImportant: form.isImportant
        }

        onSubmit(data)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h3 className={styles.headerTitle}>
                        {isEdit ? 'Edit Task' : 'Add New Task'}
                    </h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                {/* Form */}
                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className={styles.field}>
                        <label className={styles.label}>Task Title *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter task title..."
                            value={form.title}
                            onChange={e => handleChange('title', e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Add a description..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Priority & Category */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Priority</label>
                            <select
                                className={styles.select}
                                value={form.priority}
                                onChange={e => handleChange('priority', e.target.value)}
                            >
                                {PRIORITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Category</label>
                            <select
                                className={styles.select}
                                value={form.category}
                                onChange={e => handleChange('category', e.target.value)}
                            >
                                {CATEGORY_OPTIONS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Due Date & Time */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Due Date</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={form.dueDate}
                                onChange={e => handleChange('dueDate', e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Due Time</label>
                            <input
                                type="time"
                                className={styles.input}
                                value={form.dueTime}
                                onChange={e => handleChange('dueTime', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Reminder */}
                    <div className={styles.field}>
                        <div className={styles.toggleRow}>
                            <label className={styles.label}>Reminder</label>
                            <button
                                type="button"
                                className={`${styles.toggle} ${form.reminderEnabled ? styles.toggleActive : ''}`}
                                onClick={() => handleChange('reminderEnabled', !form.reminderEnabled)}
                            >
                                <span className={styles.toggleThumb} />
                            </button>
                        </div>
                        {form.reminderEnabled && (
                            <select
                                className={styles.select}
                                value={form.reminderBefore}
                                onChange={e => handleChange('reminderBefore', Number(e.target.value))}
                            >
                                {REMINDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Subtasks */}
                    <div className={styles.field}>
                        <label className={styles.label}>Subtasks</label>
                        <div className={styles.subtaskList}>
                            {form.subtasks.map((st, idx) => (
                                <div key={idx} className={styles.subtaskRow}>
                                    <span className={styles.subtaskText}>{st.title}</span>
                                    <button
                                        type="button"
                                        className={styles.subtaskRemove}
                                        onClick={() => handleRemoveSubtask(idx)}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.subtaskInput}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Add a subtask..."
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={handleSubtaskKeyDown}
                            />
                            <button
                                type="button"
                                className={styles.subtaskAddBtn}
                                onClick={handleAddSubtask}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                            </button>
                        </div>
                    </div>

                    {/* Recurring */}
                    <div className={styles.field}>
                        <label className={styles.label}>Recurring</label>
                        <div className={styles.recurringOptions}>
                            {RECURRING_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`${styles.recurringBtn} ${form.recurring === opt.value ? styles.recurringActive : ''}`}
                                    onClick={() => handleChange('recurring', opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Important */}
                    <div className={styles.field}>
                        <div className={styles.toggleRow}>
                            <label className={styles.label}>Mark as Important</label>
                            <button
                                type="button"
                                className={`${styles.toggle} ${form.isImportant ? styles.toggleActive : ''}`}
                                onClick={() => handleChange('isImportant', !form.isImportant)}
                            >
                                <span className={styles.toggleThumb} />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !form.title.trim()}
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
