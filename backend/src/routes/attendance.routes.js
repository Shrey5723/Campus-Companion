const express = require('express')
const attendanceController = require('../controllers/attendance.controller')
const { protect } = require('../middleware/auth.middleware')
const {
    validateToggle,
    validateBulkMark,
    validateBunkCalculator,
    validateDateParam,
    validateHoliday,
    validateSemesterStart,
    validateLectureAdjustment
} = require('../validators/attendance.validator')

const attendanceRouter = express.Router()

// ──────────────────────────────────────────────
// All attendance routes are PROTECTED
// The protect middleware runs first on every route.
// It verifies the JWT cookie and attaches req.student.
// Students can only access their OWN attendance data
// (studentId comes from req.student._id, not from URL params).
// ──────────────────────────────────────────────

// ─── Attendance Summary ───
// GET /api/attendance/summary
// Returns subject-wise attendance totals (the main dashboard view)
attendanceRouter.get('/summary', protect, attendanceController.getSummary)

// ─── Attendance By Date (Calendar View) ───
// GET /api/attendance/date/:date
// Returns all subject-wise attendance for a specific date
attendanceRouter.get('/date/:date', protect, validateDateParam, attendanceController.getByDate)

// ─── Toggle Attendance ───
// PUT /api/attendance/toggle
// Toggle present/absent for a single subject on a date
attendanceRouter.put('/toggle', protect, validateToggle, attendanceController.toggleAttendance)

// ─── Bulk Mark Attendance ───
// POST /api/attendance/bulk
// Mark attendance for multiple subjects on a single date
attendanceRouter.post('/bulk', protect, validateBulkMark, attendanceController.bulkMark)

// ─── Bunk Calculator ───
// GET /api/attendance/bunk-calculator?percentage=75
// Calculate how many lectures can be bunked
attendanceRouter.get('/bunk-calculator', protect, validateBunkCalculator, attendanceController.calculateBunks)

// ─── Timetable ───
// GET /api/attendance/timetable
// Get the student's weekly timetable (based on division)
attendanceRouter.get('/timetable', protect, attendanceController.getTimetable)

// ─── Holidays ───
// POST /api/attendance/holidays — Add a holiday
attendanceRouter.post('/holidays', protect, validateHoliday, attendanceController.addHoliday)

// DELETE /api/attendance/holidays/:date — Remove a holiday
attendanceRouter.delete('/holidays/:date', protect, validateDateParam, attendanceController.removeHoliday)

// GET /api/attendance/holidays — Get all holidays
attendanceRouter.get('/holidays', protect, attendanceController.getHolidays)

// ─── Semester Start Date ───
// PUT /api/attendance/semester-start — Set semester start date
attendanceRouter.put('/semester-start', protect, validateSemesterStart, attendanceController.setSemesterStart)

// ─── Lecture Adjustments ───
// POST /api/attendance/adjustments — Add a lecture adjustment (+1 extra or -1 cancelled)
attendanceRouter.post('/adjustments', protect, validateLectureAdjustment, attendanceController.addLectureAdjustment)

// DELETE /api/attendance/adjustments — Remove a lecture adjustment (body: { date, subject, type })
attendanceRouter.delete('/adjustments', protect, attendanceController.removeLectureAdjustment)

// GET /api/attendance/adjustments — Get all lecture adjustments
attendanceRouter.get('/adjustments', protect, attendanceController.getLectureAdjustments)

// ─── Subject History ───
// GET /api/attendance/subject/:subject — Get date-wise history for a subject
attendanceRouter.get('/subject/:subject', protect, attendanceController.getSubjectHistory)

module.exports = attendanceRouter
