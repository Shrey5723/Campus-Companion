const Holiday = require('../models/holiday.model')
const Attendance = require('../models/attendance.model')

// ──────────────────────────────────────────────
// Holiday Service
// Handles CRUD operations for holidays.
// Holidays are dates excluded from attendance counting.
// ──────────────────────────────────────────────

// Helper: Strip time from a date (set to midnight UTC)
function stripTime(date) {
    if (!date) return null
    if (typeof date === 'string') {
        const parts = date.split('T')[0].split('-').map(Number)
        if (parts.length === 3) {
            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
        }
    }
    const d = new Date(date)
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// Add a holiday
// Uses findOneAndUpdate with upsert to avoid duplicates.
// If the date is already marked as a holiday, it updates the reason.
// Also cleans up any existing attendance records for that holiday date.
async function addHoliday(studentId, date, reason = '') {
    const targetDate = stripTime(date)

    const holiday = await Holiday.findOneAndUpdate(
        { studentId, date: targetDate },
        { studentId, date: targetDate, reason },
        { upsert: true, new: true }
    )

    // Clean up any attendance records on this holiday date so they don't count toward attendance
    await Attendance.deleteMany({ studentId, date: targetDate })

    return holiday
}

// Remove a holiday
async function removeHoliday(studentId, date) {
    const targetDate = stripTime(date)

    const result = await Holiday.findOneAndDelete({ studentId, date: targetDate })

    if (!result) {
        const error = new Error('Holiday not found for this date')
        error.statusCode = 404
        throw error
    }

    return result
}

// Get all holidays for a student
async function getHolidays(studentId) {
    const holidays = await Holiday.find({ studentId }).sort({ date: 1 })
    return holidays
}

// Check if a specific date is a holiday for a student
async function isHoliday(studentId, date) {
    const targetDate = stripTime(date)
    const holiday = await Holiday.findOne({ studentId, date: targetDate })
    return !!holiday
}

// Get all holiday dates as a Set for fast lookup
// Used internally by attendance.service.js when calculating totals.
async function getHolidayDatesSet(studentId) {
    const holidays = await Holiday.find({ studentId }).select('date')
    const dateSet = new Set()

    holidays.forEach(h => {
        // Convert to YYYY-MM-DD string for consistent comparison
        dateSet.add(h.date.toISOString().split('T')[0])
    })

    return dateSet
}

// Bulk add holidays (used by seed script)
async function bulkAddHolidays(studentId, holidays) {
    const operations = holidays.map(h => {
        const targetDate = stripTime(h.date)
        return {
            updateOne: {
                filter: { studentId, date: targetDate },
                update: { studentId, date: targetDate, reason: h.reason || '' },
                upsert: true
            }
        }
    })

    if (operations.length > 0) {
        await Holiday.bulkWrite(operations)
    }
}

module.exports = {
    addHoliday,
    removeHoliday,
    getHolidays,
    isHoliday,
    getHolidayDatesSet,
    bulkAddHolidays
}
