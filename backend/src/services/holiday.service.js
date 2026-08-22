const Holiday = require('../models/holiday.model')

// ──────────────────────────────────────────────
// Holiday Service
// Handles CRUD operations for holidays.
// Holidays are dates excluded from attendance counting.
// ──────────────────────────────────────────────

// Add a holiday
// Uses findOneAndUpdate with upsert to avoid duplicates.
// If the date is already marked as a holiday, it updates the reason.
async function addHoliday(studentId, date, reason = '') {
    const holiday = await Holiday.findOneAndUpdate(
        { studentId, date },
        { studentId, date, reason },
        { upsert: true, new: true }
        // upsert: true  → create if doesn't exist, update if it does
        // new: true      → return the updated/created document
    )
    return holiday
}

// Remove a holiday
async function removeHoliday(studentId, date) {
    const result = await Holiday.findOneAndDelete({ studentId, date })

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
    const holiday = await Holiday.findOne({ studentId, date })
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
    const operations = holidays.map(h => ({
        updateOne: {
            filter: { studentId, date: new Date(h.date) },
            update: { studentId, date: new Date(h.date), reason: h.reason || '' },
            upsert: true
        }
    }))

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
