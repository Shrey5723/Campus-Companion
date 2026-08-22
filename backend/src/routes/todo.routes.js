const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const todoController = require('../controllers/todo.controller')

// ──────────────────────────────────────────────
// Todo Routes
// All routes are protected — student must be logged in.
// Base path: /api/todos (set in app.js)
// ──────────────────────────────────────────────

// Apply protect middleware to ALL routes in this router
router.use(protect)

// GET /api/todos — List todos with optional filters
// Query: ?filter=today|upcoming|completed|overdue|important
//        &sort=dueDate|priority|createdAt
//        &search=searchText
router.get('/', todoController.getTodos)

// GET /api/todos/stats — Get aggregate stats
router.get('/stats', todoController.getStats)

// POST /api/todos — Create a new todo
router.post('/', todoController.createTodo)

// PUT /api/todos/:id — Update a todo
router.put('/:id', todoController.updateTodo)

// DELETE /api/todos/:id — Delete a todo
router.delete('/:id', todoController.deleteTodo)

// PATCH /api/todos/:id/toggle — Toggle complete/pending
router.patch('/:id/toggle', todoController.toggleComplete)

// PATCH /api/todos/:id/important — Toggle important flag
router.patch('/:id/important', todoController.toggleImportant)

// PATCH /api/todos/:id/subtasks/:subtaskId/toggle — Toggle subtask
router.patch('/:id/subtasks/:subtaskId/toggle', todoController.toggleSubtask)

module.exports = router
