const todoService = require('../services/todo.service')

// ──────────────────────────────────────────────
// Todo Controller
// Handles HTTP requests for task management.
// Each handler: extract data → call service → send response
// All routes are protected — req.student is set by auth middleware
// ──────────────────────────────────────────────

// GET /api/todos
// Query params: filter, sort, search
async function getTodos(req, res) {
    try {
        const { filter, sort, search } = req.query
        const todos = await todoService.getTodos(req.student._id, { filter, sort, search })

        return res.status(200).json({
            success: true,
            data: todos
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch tasks'
        })
    }
}

// GET /api/todos/stats
async function getStats(req, res) {
    try {
        const stats = await todoService.getTodoStats(req.student._id)

        return res.status(200).json({
            success: true,
            data: stats
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch stats'
        })
    }
}

// POST /api/todos
async function createTodo(req, res) {
    try {
        const todo = await todoService.createTodo(req.student._id, req.body)

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: todo
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to create task'
        })
    }
}

// PUT /api/todos/:id
async function updateTodo(req, res) {
    try {
        const todo = await todoService.updateTodo(req.student._id, req.params.id, req.body)

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: todo
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update task'
        })
    }
}

// DELETE /api/todos/:id
async function deleteTodo(req, res) {
    try {
        await todoService.deleteTodo(req.student._id, req.params.id)

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to delete task'
        })
    }
}

// PATCH /api/todos/:id/toggle
async function toggleComplete(req, res) {
    try {
        const todo = await todoService.toggleComplete(req.student._id, req.params.id)

        return res.status(200).json({
            success: true,
            message: todo.status === 'completed' ? 'Task completed!' : 'Task reopened',
            data: todo
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to toggle task'
        })
    }
}

// PATCH /api/todos/:id/important
async function toggleImportant(req, res) {
    try {
        const todo = await todoService.toggleImportant(req.student._id, req.params.id)

        return res.status(200).json({
            success: true,
            data: todo
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to toggle importance'
        })
    }
}

// PATCH /api/todos/:id/subtasks/:subtaskId/toggle
async function toggleSubtask(req, res) {
    try {
        const todo = await todoService.toggleSubtask(
            req.student._id,
            req.params.id,
            req.params.subtaskId
        )

        return res.status(200).json({
            success: true,
            data: todo
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to toggle subtask'
        })
    }
}

module.exports = {
    getTodos,
    getStats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    toggleImportant,
    toggleSubtask
}
