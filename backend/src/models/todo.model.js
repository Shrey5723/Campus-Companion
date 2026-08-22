const mongoose = require('mongoose')

// ──────────────────────────────────────────────
// Todo Schema
// Per-student task management with deadlines,
// priorities, categories, subtasks, reminders,
// recurring schedules, and importance flags.
// ──────────────────────────────────────────────

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
})

const todoSchema = new mongoose.Schema({

    // ──────────────────────────────────────────────
    // Ownership
    // Links each todo to the student who created it.
    // Indexed for fast per-student queries.
    // ──────────────────────────────────────────────

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },

    // ──────────────────────────────────────────────
    // Core Fields
    // ──────────────────────────────────────────────

    title: {
        type: String,
        required: true,
        trim: true
        // The main task title, e.g. "Complete FSD Assignment 3"
    },

    description: {
        type: String,
        trim: true,
        default: ''
        // Optional longer description of the task
    },

    // ──────────────────────────────────────────────
    // Priority & Categorization
    // ──────────────────────────────────────────────

    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
        // Determines the color of the priority badge:
        // high = red, medium = yellow, low = green
    },

    category: {
        type: String,
        trim: true,
        default: 'General'
        // Subject-based tag like "FSD", "DAA", "CN", "MI"
        // or a custom category like "Personal", "Club"
    },

    // ──────────────────────────────────────────────
    // Status & Completion
    // ──────────────────────────────────────────────

    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
        // pending: not started
        // in_progress: actively working on it
        // completed: done
    },

    completedAt: {
        type: Date,
        default: null
        // Set when status changes to 'completed'
        // Reset to null if status changes back
    },

    // ──────────────────────────────────────────────
    // Deadline
    // ──────────────────────────────────────────────

    dueDate: {
        type: Date,
        default: null
        // The deadline date for this task.
        // Used for overdue detection and filtering.
    },

    dueTime: {
        type: String,
        default: null
        // Optional time string like "14:30"
        // Stored separately from dueDate for simpler handling
    },

    // ──────────────────────────────────────────────
    // Reminder
    // ──────────────────────────────────────────────

    reminder: {
        enabled: {
            type: Boolean,
            default: false
        },
        beforeMinutes: {
            type: Number,
            default: 60
            // How many minutes before the deadline to trigger
            // Common values: 30, 60, 1440 (1 day)
        }
    },

    // ──────────────────────────────────────────────
    // Subtasks
    // Nested checklist items within the task
    // ──────────────────────────────────────────────

    subtasks: {
        type: [subtaskSchema],
        default: []
    },

    // ──────────────────────────────────────────────
    // Recurring
    // ──────────────────────────────────────────────

    recurring: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly'],
        default: 'none'
        // When a recurring task is completed, a new occurrence
        // is automatically created with the next due date.
    },

    // ──────────────────────────────────────────────
    // Important Flag
    // Star/pin functionality for quick access
    // ──────────────────────────────────────────────

    isImportant: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
    // Adds createdAt and updatedAt automatically
})

// Compound index for efficient per-student queries with sorting
todoSchema.index({ student: 1, dueDate: 1 })
todoSchema.index({ student: 1, status: 1 })
todoSchema.index({ student: 1, priority: 1 })

const Todo = mongoose.model('Todo', todoSchema)

module.exports = Todo
