const LectureAdjustment = require('../models/lectureAdjustment.model')

// ──────────────────────────────────────────────
// Lecture Adjustment Service
// CRUD operations for per-student lecture overrides.
//
// These adjustments are consumed by attendance.service.js
// in calculateTotalLectures() to modify the timetable-based
// lecture count.
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

// Add or update a lecture adjustment
// Uses upsert so calling twice for the same date+subject+type updates it.
async function addAdjustment(studentId, date, subject, type, adjustment, reason = '') {
    const targetDate = stripTime(date)

    const result = await LectureAdjustment.findOneAndUpdate(
        { studentId, date: targetDate, subject, type },
        { studentId, date: targetDate, subject, type, adjustment, reason },
        { upsert: true, new: true }
    )

    return result
}

// Remove a lecture adjustment
async function removeAdjustment(studentId, date, subject, type) {
    const targetDate = stripTime(date)

    const result = await LectureAdjustment.findOneAndDelete({
        studentId, date: targetDate, subject, type
    })

    if (!result) {
        const error = new Error('Lecture adjustment not found for this date/subject/type')
        error.statusCode = 404
        throw error
    }

    return result
}

// Get all adjustments for a student (sorted by date)
async function getAdjustments(studentId) {
    return await LectureAdjustment.find({ studentId }).sort({ date: -1 })
}

// Get adjustments within a date range (used by calculateTotalLectures)
// Returns a map: { 'YYYY-MM-DD_SUBJECT_TYPE': adjustment }
async function getAdjustmentsMap(studentId, startDate, endDate) {
    const start = stripTime(startDate)
    const end = stripTime(endDate)

    const adjustments = await LectureAdjustment.find({
        studentId,
        date: { $gte: start, $lte: end }
    })

    // Build a lookup map keyed by 'YYYY-MM-DD_SUBJECT_TYPE'
    const map = {}
    adjustments.forEach(adj => {
        const dateStr = adj.date.toISOString().split('T')[0]
        const key = `${dateStr}_${adj.subject}_${adj.type}`
        map[key] = adj.adjustment
    })

    return map
}

// Get adjustments for a specific date (used by getAttendanceByDate)
async function getAdjustmentsForDate(studentId, date) {
    const targetDate = stripTime(date)
    return await LectureAdjustment.find({ studentId, date: targetDate })
}

module.exports = {
    addAdjustment,
    removeAdjustment,
    getAdjustments,
    getAdjustmentsMap,
    getAdjustmentsForDate
}
