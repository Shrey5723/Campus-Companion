import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
    fetchTodos,
    fetchTodoStats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    toggleImportant,
    toggleSubtask,
    setFilter,
    setSort,
    setSearch
} from '../../store/todoSlice'
import { useReminders } from '../../hooks/useReminders'
import { useToast } from '../../components/common/Toast/Toast'
import TodoItem from '../../components/todo/TodoItem/TodoItem'
import TodoModal from '../../components/todo/TodoModal/TodoModal'
import styles from './TodoPage.module.css'

// ──────────────────────────────────────────────
// TodoPage
// Main To-Do List view with stats, filters,
// search, sort, task list, and add/edit modal
// Uses Material Symbols Outlined icons
// ──────────────────────────────────────────────

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'important', label: 'Important' }
]

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' }
]

export default function TodoPage() {
    const dispatch = useDispatch()
    const toast = useToast()
    const {
        todos,
        stats,
        loading,
        createLoading,
        activeFilter,
        sortBy,
        searchQuery
    } = useSelector(state => state.todos)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingTodo, setEditingTodo] = useState(null)
    const [searchInput, setSearchInput] = useState('')

    // Initialize reminders for browser notifications
    useReminders()

    // Fetch todos and stats on mount and when filter/sort/search changes
    useEffect(() => {
        dispatch(fetchTodos({ filter: activeFilter, sort: sortBy, search: searchQuery }))
        dispatch(fetchTodoStats())
    }, [dispatch, activeFilter, sortBy, searchQuery])

    // ─── Handlers ───

    const handleFilterChange = useCallback((filter) => {
        dispatch(setFilter(filter))
    }, [dispatch])

    const handleSortChange = useCallback((e) => {
        dispatch(setSort(e.target.value))
    }, [dispatch])

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault()
        dispatch(setSearch(searchInput))
    }, [dispatch, searchInput])

    const handleSearchClear = useCallback(() => {
        setSearchInput('')
        dispatch(setSearch(''))
    }, [dispatch])

    const handleCreateTodo = useCallback(async (data) => {
        try {
            await dispatch(createTodo(data)).unwrap()
            setModalOpen(false)
            dispatch(fetchTodoStats())
            toast.success('Task created successfully!')
        } catch (err) {
            toast.error(err || 'Failed to create task')
        }
    }, [dispatch, toast])

    const handleUpdateTodo = useCallback(async (data) => {
        try {
            await dispatch(updateTodo({ id: editingTodo._id, data })).unwrap()
            setEditingTodo(null)
            setModalOpen(false)
            dispatch(fetchTodoStats())
            toast.success('Task updated successfully!')
        } catch (err) {
            toast.error(err || 'Failed to update task')
        }
    }, [dispatch, editingTodo, toast])

    const handleDeleteTodo = useCallback(async (id) => {
        try {
            await dispatch(deleteTodo(id)).unwrap()
            dispatch(fetchTodoStats())
            toast.success('Task deleted')
        } catch (err) {
            toast.error(err || 'Failed to delete task')
        }
    }, [dispatch, toast])

    const handleToggleComplete = useCallback(async (id) => {
        try {
            const result = await dispatch(toggleComplete(id)).unwrap()
            dispatch(fetchTodoStats())
            if (result.status === 'completed') {
                toast.success('Task completed! 🎉')
            }
        } catch (err) {
            toast.error(err || 'Failed to toggle task')
        }
    }, [dispatch, toast])

    const handleToggleImportant = useCallback(async (id) => {
        try {
            await dispatch(toggleImportant(id)).unwrap()
        } catch (err) {
            toast.error(err || 'Failed to toggle importance')
        }
    }, [dispatch, toast])

    const handleToggleSubtask = useCallback(async (todoId, subtaskId) => {
        try {
            await dispatch(toggleSubtask({ todoId, subtaskId })).unwrap()
        } catch (err) {
            toast.error(err || 'Failed to toggle subtask')
        }
    }, [dispatch, toast])

    const handleEdit = useCallback((todo) => {
        setEditingTodo(todo)
        setModalOpen(true)
    }, [])

    const handleOpenCreate = useCallback(() => {
        setEditingTodo(null)
        setModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setModalOpen(false)
        setEditingTodo(null)
    }, [])

    return (
        <motion.div
            className={styles.page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* ─── Header ─── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.filterTabs}>
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterTabActive : ''}`}
                                onClick={() => handleFilterChange(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button className={styles.addBtn} onClick={handleOpenCreate}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                    Add Task
                </button>
            </div>

            {/* ─── Stats Bar ─── */}
            <div className={styles.statsBar}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>checklist</span>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Tasks</span>
                        <span className={styles.statValue}>{stats?.total ?? '—'}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconCompleted}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Completed</span>
                        <span className={`${styles.statValue} ${styles.statCompleted}`}>
                            {stats?.completed ?? '—'}
                        </span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconProgress}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>schedule</span>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>In Progress</span>
                        <span className={`${styles.statValue} ${styles.statProgress}`}>
                            {stats?.inProgress ?? '—'}
                        </span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconOverdue}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Overdue</span>
                        <span className={`${styles.statValue} ${styles.statOverdue}`}>
                            {stats?.overdue ?? '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Search & Sort Bar ─── */}
            <div className={styles.toolsBar}>
                <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                    <span className={`material-symbols-outlined ${styles.searchIcon}`} style={{ fontSize: 16 }}>search</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search tasks..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className={styles.searchClear}
                            onClick={handleSearchClear}
                        >
                            ×
                        </button>
                    )}
                </form>
                <div className={styles.sortWrapper}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>swap_vert</span>
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={handleSortChange}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ─── Task List ─── */}
            <div className={styles.taskList}>
                {loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.loader} />
                        <p>Loading tasks...</p>
                    </div>
                ) : todos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h3 className={styles.emptyTitle}>
                            {searchQuery
                                ? 'No tasks found'
                                : activeFilter === 'completed'
                                    ? 'No completed tasks yet'
                                    : activeFilter === 'overdue'
                                        ? 'No overdue tasks — great job!'
                                        : 'No tasks yet'}
                        </h3>
                        <p className={styles.emptyText}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Click "Add Task" to create your first task'}
                        </p>
                        {!searchQuery && (
                            <button className={styles.addBtn} onClick={handleOpenCreate}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                                Add Task
                            </button>
                        )}
                    </div>
                ) : (
                    todos.map(todo => (
                        <TodoItem
                            key={todo._id}
                            todo={todo}
                            onToggleComplete={handleToggleComplete}
                            onToggleImportant={handleToggleImportant}
                            onToggleSubtask={handleToggleSubtask}
                            onEdit={handleEdit}
                            onDelete={handleDeleteTodo}
                        />
                    ))
                )}
            </div>

            {/* ─── Modal ─── */}
            <TodoModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
                editingTodo={editingTodo}
                loading={createLoading}
            />
        </motion.div>
    )
}
