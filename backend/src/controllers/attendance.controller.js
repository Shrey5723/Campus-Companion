const attendanceService = require('../services/attendance.service')
const holidayService = require('../services/holiday.service')
const lectureAdjustmentService = require('../services/lectureAdjustment.service')
const { SUBJECTS, THEORY_SCHEDULE, LAB_SCHEDULE } = require('../config/constants')

// ──────────────────────────────────────────────
// Attendance Controller
// Thin controller layer — extracts data from request,
// calls the service, sends the response.
// Same pattern as auth.controller.js.
// ──────────────────────────────────────────────


// GET /api/attendance/summary
// Returns subject-wise attendance summary (the main dashboard view)
async function getSummary(req, res) {
    try {
        const summary = await attendanceService.getSubjectWiseSummary(req.student._id)

        return res.status(200).json({
            success: true,
            message: 'Attendance summary fetched successfully',
            data: summary
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch attendance summary'
        })
    }
}


// GET /api/attendance/date/:date
// Returns attendance records for a specific date (calendar edit view)
async function getByDate(req, res) {
    try {
        const { date } = req.params
        const result = await attendanceService.getAttendanceByDate(req.student._id, date)

        return res.status(200).json({
            success: true,
            message: 'Attendance for date fetched successfully',
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch attendance for date'
        })
    }
}


// PUT /api/attendance/toggle
// Toggle present/absent for a subject on a date
async function toggleAttendance(req, res) {
    try {
        const { date, subject, type, isPresent } = req.body

        const record = await attendanceService.toggleAttendance(
            req.student._id, date, subject, type, isPresent
        )

        return res.status(200).json({
            success: true,
            message: `Attendance ${isPresent ? 'marked present' : 'marked absent'} for ${subject} (${type})`,
            data: record
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to toggle attendance'
        })
    }
}


// POST /api/attendance/bulk
// Mark attendance for multiple subjects on a date
async function bulkMark(req, res) {
    try {
        const { date, records } = req.body

        const result = await attendanceService.bulkMarkAttendance(
            req.student._id, date, records
        )

        return res.status(200).json({
            success: true,
            message: `Attendance marked for ${records.length} subjects`,
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to mark bulk attendance'
        })
    }
}


// GET /api/attendance/bunk-calculator?percentage=75
// Calculate how many lectures can be bunked
async function calculateBunks(req, res) {
    try {
        const percentage = parseFloat(req.query.percentage)

        const result = await attendanceService.calculateBunkableLectures(
            req.student._id, percentage
        )

        return res.status(200).json({
            success: true,
            message: `Bunk calculation for ${percentage}% attendance`,
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to calculate bunkable lectures'
        })
    }
}


// GET /api/attendance/timetable
// Returns the student's timetable (from constants, based on division)
async function getTimetable(req, res) {
    try {
        const division = req.student.division

        if (!division) {
            return res.status(400).json({
                success: false,
                message: 'Division not set. Please update your profile with your division (D1/D2/D3/D4).'
            })
        }

        // Build the complete timetable from constants
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const timetable = {}

        days.forEach(day => {
            const entries = []

            // Add theory lectures
            const theorySubjects = THEORY_SCHEDULE[day] || []
            theorySubjects.forEach(subject => {
                entries.push({ subject, type: 'theory' })
            })

            // Add lab lectures
            const labEntry = LAB_SCHEDULE[division][day]
            if (labEntry) {
                if (Array.isArray(labEntry)) {
                    labEntry.forEach(subject => {
                        entries.push({ subject, type: 'lab' })
                    })
                } else {
                    entries.push({ subject: labEntry, type: 'lab' })
                }
            }

            timetable[day] = entries
        })

        return res.status(200).json({
            success: true,
            message: 'Timetable fetched successfully',
            data: {
                division,
                subjects: SUBJECTS,
                timetable
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch timetable'
        })
    }
}


// POST /api/attendance/holidays
// Add a holiday
async function addHoliday(req, res) {
    try {
        const { date, reason } = req.body

        const holiday = await holidayService.addHoliday(
            req.student._id, new Date(date), reason
        )

        return res.status(201).json({
            success: true,
            message: 'Holiday added successfully',
            data: holiday
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to add holiday'
        })
    }
}


// DELETE /api/attendance/holidays/:date
// Remove a holiday
async function removeHoliday(req, res) {
    try {
        const { date } = req.params

        const result = await holidayService.removeHoliday(
            req.student._id, new Date(date)
        )

        return res.status(200).json({
            success: true,
            message: 'Holiday removed successfully',
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to remove holiday'
        })
    }
}


// GET /api/attendance/holidays
// Get all holidays
async function getHolidays(req, res) {
    try {
        const holidays = await holidayService.getHolidays(req.student._id)

        return res.status(200).json({
            success: true,
            message: 'Holidays fetched successfully',
            count: holidays.length,
            data: holidays
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch holidays'
        })
    }
}


// PUT /api/attendance/semester-start
// Set the semester start date
async function setSemesterStart(req, res) {
    try {
        const { date } = req.body

        const student = await attendanceService.setSemesterStartDate(
            req.student._id, date
        )

        return res.status(200).json({
            success: true,
            message: 'Semester start date updated successfully',
            data: { semesterStartDate: student.semesterStartDate }
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update semester start date'
        })
    }
}


// POST /api/attendance/adjustments
// Add a lecture adjustment
async function addLectureAdjustment(req, res) {
    try {
        const { date, subject, type, adjustment, reason } = req.body

        const result = await lectureAdjustmentService.addAdjustment(
            req.student._id, date, subject, type, adjustment, reason
        )

        return res.status(201).json({
            success: true,
            message: `Lecture adjustment added: ${adjustment > 0 ? 'extra' : 'cancelled'} ${subject} ${type} on ${date}`,
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to add lecture adjustment'
        })
    }
}


// DELETE /api/attendance/adjustments
// Remove a lecture adjustment
async function removeLectureAdjustment(req, res) {
    try {
        const { date, subject, type } = req.body

        const result = await lectureAdjustmentService.removeAdjustment(
            req.student._id, date, subject, type
        )

        return res.status(200).json({
            success: true,
            message: 'Lecture adjustment removed',
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to remove lecture adjustment'
        })
    }
}


// GET /api/attendance/adjustments
// Get all lecture adjustments
async function getLectureAdjustments(req, res) {
    try {
        const adjustments = await lectureAdjustmentService.getAdjustments(req.student._id)

        return res.status(200).json({
            success: true,
            message: 'Lecture adjustments fetched successfully',
            count: adjustments.length,
            data: adjustments
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch lecture adjustments'
        })
    }
}


// GET /api/attendance/subject/:subject
// Returns date-wise attendance history for a specific subject
async function getSubjectHistory(req, res) {
    try {
        const { subject } = req.params

        const result = await attendanceService.getSubjectAttendanceHistory(
            req.student._id, subject
        )

        return res.status(200).json({
            success: true,
            message: `Attendance history for ${subject} fetched successfully`,
            data: result
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch subject history'
        })
    }
}


module.exports = {
    getSummary,
    getByDate,
    toggleAttendance,
    bulkMark,
    calculateBunks,
    getTimetable,
    addHoliday,
    removeHoliday,
    getHolidays,
    setSemesterStart,
    addLectureAdjustment,
    removeLectureAdjustment,
    getLectureAdjustments,
    getSubjectHistory
}
