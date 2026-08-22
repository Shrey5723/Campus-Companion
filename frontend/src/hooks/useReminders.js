import { useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'

// ──────────────────────────────────────────────
// useReminders Hook
// Checks tasks with active reminders every 60 seconds.
// Fires browser notifications when the reminder time arrives.
// Tracks fired reminders in localStorage to avoid duplicates.
// ──────────────────────────────────────────────

const STORAGE_KEY = 'cc_fired_reminders'
const CHECK_INTERVAL = 60000 // 60 seconds

function getFiredReminders() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function markReminderFired(todoId) {
    const fired = getFiredReminders()
    fired.push({ id: todoId, at: Date.now() })
    // Keep only reminders from the last 7 days to prevent unbounded growth
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const cleaned = fired.filter(r => r.at > weekAgo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
}

function hasReminderFired(todoId) {
    return getFiredReminders().some(r => r.id === todoId)
}

export function useReminders() {
    const todos = useSelector(state => state.todos.todos)
    const intervalRef = useRef(null)

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const checkReminders = useCallback(() => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return
        }

        const now = new Date()

        for (const todo of todos) {
            // Skip if no reminder, already completed, no due date, or already fired
            if (!todo.reminder?.enabled) continue
            if (todo.status === 'completed') continue
            if (!todo.dueDate) continue
            if (hasReminderFired(todo._id)) continue

            // Calculate reminder time
            const dueDate = new Date(todo.dueDate)

            // If there's a dueTime, apply it to the due date
            if (todo.dueTime) {
                const [hours, minutes] = todo.dueTime.split(':').map(Number)
                dueDate.setHours(hours, minutes, 0, 0)
            }

            const reminderTime = new Date(
                dueDate.getTime() - (todo.reminder.beforeMinutes * 60 * 1000)
            )

            // Fire if current time is past the reminder time
            if (now >= reminderTime) {
                const timeLeft = dueDate > now
                    ? formatTimeLeft(dueDate - now)
                    : 'overdue!'

                new Notification('📋 Task Reminder', {
                    body: `"${todo.title}" is due ${timeLeft}`,
                    icon: '/favicon.ico',
                    tag: `todo-${todo._id}` // Prevents duplicate notifications
                })

                markReminderFired(todo._id)
            }
        }
    }, [todos])

    // Check reminders periodically
    useEffect(() => {
        // Run immediately on mount / todos change
        checkReminders()

        // Set interval
        intervalRef.current = setInterval(checkReminders, CHECK_INTERVAL)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [checkReminders])
}

// Format milliseconds into human-readable time left
function formatTimeLeft(ms) {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`
    return 'very soon!'
}
