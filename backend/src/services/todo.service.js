const Todo = require('../models/todo.model')

// ──────────────────────────────────────────────
// Todo Service
// Business logic for task management.
// All functions receive the studentId to ensure
// tasks are scoped to the authenticated student.
// ──────────────────────────────────────────────

// ─── Get Todos with Filters ───
// Supports: filter (today, upcoming, completed, overdue, important)
//           sort (dueDate, priority, createdAt)
//           search (title text search)
async function getTodos(studentId, { filter, sort, search } = {}) {
    const query = { student: studentId }
    const now = new Date()

    // ── Apply filter ──
    switch (filter) {
        case 'today': {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const endOfDay = new Date(startOfDay)
            endOfDay.setDate(endOfDay.getDate() + 1)
            query.dueDate = { $gte: startOfDay, $lt: endOfDay }
            query.status = { $ne: 'completed' }
            break
        }
        case 'upcoming': {
            const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            query.dueDate = { $gte: startOfTomorrow }
            query.status = { $ne: 'completed' }
            break
        }
        case 'completed': {
            query.status = 'completed'
            break
        }
        case 'overdue': {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            query.dueDate = { $lt: startOfDay }
            query.status = { $ne: 'completed' }
            break
        }
        case 'important': {
            query.isImportant = true
            query.status = { $ne: 'completed' }
            break
        }
        default:
            // 'all' — no additional filters
            break
    }

    // ── Apply search ──
    if (search && search.trim()) {
        query.title = { $regex: search.trim(), $options: 'i' }
    }

    // ── Apply sort ──
    let sortOption = { createdAt: -1 } // default: newest first
    switch (sort) {
        case 'dueDate':
            // Tasks without due dates go to the end
            sortOption = { dueDate: 1, createdAt: -1 }
            break
        case 'priority': {
            // We'll sort after query since priority is a string enum
            // For now, use createdAt and sort in memory
            sortOption = { createdAt: -1 }
            break
        }
        case 'createdAt':
            sortOption = { createdAt: -1 }
            break
    }

    let todos = await Todo.find(query).sort(sortOption).lean()

    // Sort by priority in memory if requested
    // Priority order: high > medium > low
    if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        todos.sort((a, b) => {
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
        })
    }

    return todos
}

// ─── Get Stats ───
// Returns aggregate counts for the dashboard stats bar
async function getTodoStats(studentId) {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [total, completed, inProgress, overdue] = await Promise.all([
        Todo.countDocuments({ student: studentId }),
        Todo.countDocuments({ student: studentId, status: 'completed' }),
        Todo.countDocuments({ student: studentId, status: 'in_progress' }),
        Todo.countDocuments({
            student: studentId,
            status: { $ne: 'completed' },
            dueDate: { $lt: startOfDay, $ne: null }
        })
    ])

    // Pending = total - completed - inProgress
    const pending = total - completed - inProgress

    return { total, completed, inProgress, overdue, pending }
}

// ─── Create Todo ───
async function createTodo(studentId, data) {
    const todo = new Todo({
        student: studentId,
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        category: data.category || 'General',
        status: data.status || 'pending',
        dueDate: data.dueDate || null,
        dueTime: data.dueTime || null,
        reminder: {
            enabled: data.reminder?.enabled || false,
            beforeMinutes: data.reminder?.beforeMinutes || 60
        },
        subtasks: data.subtasks || [],
        recurring: data.recurring || 'none',
        isImportant: data.isImportant || false
    })

    await todo.save()
    return todo.toObject()
}

// ─── Update Todo ───
async function updateTodo(studentId, todoId, data) {
    const todo = await Todo.findOne({ _id: todoId, student: studentId })

    if (!todo) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    // Update only provided fields
    const allowedFields = [
        'title', 'description', 'priority', 'category',
        'status', 'dueDate', 'dueTime', 'reminder',
        'subtasks', 'recurring', 'isImportant'
    ]

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            todo[field] = data[field]
        }
    }

    // If status changed to completed, set completedAt
    if (data.status === 'completed' && !todo.completedAt) {
        todo.completedAt = new Date()
    } else if (data.status && data.status !== 'completed') {
        todo.completedAt = null
    }

    await todo.save()
    return todo.toObject()
}

// ─── Delete Todo ───
async function deleteTodo(studentId, todoId) {
    const todo = await Todo.findOneAndDelete({ _id: todoId, student: studentId })

    if (!todo) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    return todo.toObject()
}

// ─── Toggle Complete ───
// Toggles between pending and completed.
// If the task is recurring and being completed, creates the next occurrence.
async function toggleComplete(studentId, todoId) {
    const todo = await Todo.findOne({ _id: todoId, student: studentId })

    if (!todo) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    if (todo.status === 'completed') {
        // Uncomplete — go back to pending
        todo.status = 'pending'
        todo.completedAt = null
    } else {
        // Complete
        todo.status = 'completed'
        todo.completedAt = new Date()

        // If recurring, create next occurrence
        if (todo.recurring !== 'none' && todo.dueDate) {
            await createNextRecurrence(todo)
        }
    }

    await todo.save()
    return todo.toObject()
}

// ─── Create Next Recurrence ───
// Helper: creates the next occurrence of a recurring task
async function createNextRecurrence(completedTodo) {
    const nextDueDate = new Date(completedTodo.dueDate)

    switch (completedTodo.recurring) {
        case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1)
            break
        case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7)
            break
        case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            break
    }

    // Reset subtasks to uncompleted
    const resetSubtasks = completedTodo.subtasks.map(st => ({
        title: st.title,
        isCompleted: false
    }))

    const newTodo = new Todo({
        student: completedTodo.student,
        title: completedTodo.title,
        description: completedTodo.description,
        priority: completedTodo.priority,
        category: completedTodo.category,
        status: 'pending',
        dueDate: nextDueDate,
        dueTime: completedTodo.dueTime,
        reminder: completedTodo.reminder,
        subtasks: resetSubtasks,
        recurring: completedTodo.recurring,
        isImportant: completedTodo.isImportant
    })

    await newTodo.save()
}

// ─── Toggle Important ───
async function toggleImportant(studentId, todoId) {
    const todo = await Todo.findOne({ _id: todoId, student: studentId })

    if (!todo) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    todo.isImportant = !todo.isImportant
    await todo.save()
    return todo.toObject()
}

// ─── Toggle Subtask ───
async function toggleSubtask(studentId, todoId, subtaskId) {
    const todo = await Todo.findOne({ _id: todoId, student: studentId })

    if (!todo) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    const subtask = todo.subtasks.id(subtaskId)

    if (!subtask) {
        const error = new Error('Subtask not found')
        error.statusCode = 404
        throw error
    }

    subtask.isCompleted = !subtask.isCompleted
    await todo.save()
    return todo.toObject()
}

module.exports = {
    getTodos,
    getTodoStats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    toggleImportant,
    toggleSubtask
}
