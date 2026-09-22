const Attendance = require('../models/attendance.model')
const Student = require('../models/student.model')
const holidayService = require('./holiday.service')
const lectureAdjustmentService = require('./lectureAdjustment.service')
const {
    SUBJECTS,
    THEORY_SCHEDULE,
    LAB_SCHEDULE,
    TEACHING_PHASES,
    EXAM_PERIODS,
    MAX_THEORY_LECTURES,
    MAX_LAB_LECTURES,
    SEMESTER_START_DATE,
    SEMESTER_END_DATE
} = require('../config/constants')

// ──────────────────────────────────────────────
// Attendance Service
// Core business logic for attendance tracking.
//
// KEY CONCEPTS:
// 1. "Total lectures held" = lectures scheduled by timetable from
//    semester start to today, MINUS holidays and exam periods.
// 2. "Attended" = records where isPresent === true.
// 3. "Percentage" = (attended / total) × 100.
// ──────────────────────────────────────────────


// ──────────────────────────────────────────────
// Helper: Get the day name from a UTC Date object
// Returns lowercase day name like 'monday', 'tuesday', etc.
// ──────────────────────────────────────────────
function getDayName(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getUTCDay()]
}

// ──────────────────────────────────────────────
// Helper: Strip time from a date (set to midnight UTC)
// This ensures consistent date comparison without timezone issues.
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Helper: Check if a date falls within any exam period
// Exam periods are non-teaching days, so no lectures happen.
// ──────────────────────────────────────────────
function isExamPeriod(dateStr) {
    return EXAM_PERIODS.some(period => {
        return dateStr >= period.start && dateStr <= period.end
    })
}

// ──────────────────────────────────────────────
// Helper: Check if a date falls within any teaching phase
// Only dates within teaching phases count for attendance.
// ──────────────────────────────────────────────
function isTeachingDay(dateStr) {
    return TEACHING_PHASES.some(phase => {
        return dateStr >= phase.start && dateStr <= phase.end
    })
}

// ──────────────────────────────────────────────
// Helper: Get scheduled subjects for a specific date
// Uses the timetable to determine what subjects (theory + lab)
// a student should have on a given date.
//
// Returns: [{ subject: 'DAA', type: 'theory' }, { subject: 'CN', type: 'lab' }, ...]
// ──────────────────────────────────────────────
function getScheduledSubjects(date, division) {
    const dayName = getDayName(date)
    const scheduled = []

    // Add theory lectures for this day
    const theorySubjects = THEORY_SCHEDULE[dayName] || []
    theorySubjects.forEach(subject => {
        scheduled.push({ subject, type: 'theory' })
    })

    // Add lab lectures for this day (based on student's division)
    if (division && LAB_SCHEDULE[division]) {
        const labEntry = LAB_SCHEDULE[division][dayName]

        if (labEntry) {
            if (Array.isArray(labEntry)) {
                // Wednesday has 2 labs (e.g., ['DAA', 'DAV'] for D1)
                labEntry.forEach(subject => {
                    scheduled.push({ subject, type: 'lab' })
                })
            } else {
                // Single lab subject
                scheduled.push({ subject: labEntry, type: 'lab' })
            }
        }
    }

    return scheduled
}

// ──────────────────────────────────────────────
// Calculate total lectures held per subject (theory + lab)
// from semesterStartDate to the given endDate.
//
// This iterates through each date, checks the timetable,
// and counts how many lectures of each subject were scheduled,
// excluding holidays and exam periods.
//
// Returns: { DAA: { theory: 12, lab: 4 }, CN: { theory: 10, lab: 3 }, ... }
// ──────────────────────────────────────────────
async function calculateTotalLectures(studentId, division, endDate, semesterStartDate) {
    // Get holiday dates as a Set for O(1) lookup
    const holidayDates = await holidayService.getHolidayDatesSet(studentId)

    // Initialize counts for all subjects
    const totals = {}
    SUBJECTS.forEach(subject => {
        totals[subject] = { theory: 0, lab: 0 }
    })

    // Iterate from semester start to endDate (inclusive)
    const effectiveStart = semesterStartDate || SEMESTER_START_DATE
    const start = stripTime(effectiveStart)
    const end = stripTime(endDate)
    const current = new Date(start)

    while (current <= end) {
        const dateStr = current.toISOString().split('T')[0] // 'YYYY-MM-DD'

        // Skip weekends (Sunday = 0, Saturday = 6)
        const dayOfWeek = current.getUTCDay()
        if (dayOfWeek === 0) {
            // Sunday — no classes
            current.setUTCDate(current.getUTCDate() + 1)
            continue
        }

        // Skip if not within any teaching phase
        if (!isTeachingDay(dateStr)) {
            current.setUTCDate(current.getUTCDate() + 1)
            continue
        }

        // Skip exam periods
        if (isExamPeriod(dateStr)) {
            current.setUTCDate(current.getUTCDate() + 1)
            continue
        }

        // Skip holidays
        if (holidayDates.has(dateStr)) {
            current.setUTCDate(current.getUTCDate() + 1)
            continue
        }

        // Get scheduled subjects for this date
        const scheduled = getScheduledSubjects(current, division)

        // Count each scheduled lecture
        scheduled.forEach(({ subject, type }) => {
            if (totals[subject]) {
                totals[subject][type]++
            }
        })

        current.setUTCDate(current.getUTCDate() + 1)
    }

    // Apply lecture adjustments
    // Query all adjustments in the date range and modify totals
    const adjustmentsMap = await lectureAdjustmentService.getAdjustmentsMap(
        studentId, effectiveStart, endDate
    )

    // adjustmentsMap keys are 'YYYY-MM-DD_SUBJECT_TYPE' → adjustment (+1 or -1)
    Object.entries(adjustmentsMap).forEach(([key, adjustment]) => {
        // key format: '2026-08-15_DAA_theory'
        const parts = key.split('_')
        const subject = parts[1]
        const type = parts[2]

        if (totals[subject]) {
            totals[subject][type] = Math.max(0, totals[subject][type] + adjustment)
        }
    })

    return totals
}


// ══════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ══════════════════════════════════════════════


// ──────────────────────────────────────────────
// Get Subject-Wise Attendance Summary
// Returns the "dashboard" view: for each subject,
// shows attended/total/percentage for both theory and lab.
//
// This is the main endpoint the frontend will call
// to show the overall attendance card.
// ──────────────────────────────────────────────
async function getSubjectWiseSummary(studentId) {
    // Step 1: Get student to find their division and semester start
    const student = await Student.findById(studentId).select('division semesterStartDate')

    if (!student) {
        const error = new Error('Student not found')
        error.statusCode = 404
        throw error
    }

    if (!student.division) {
        const error = new Error('Student division not set. Please update your profile with your division (D1/D2/D3/D4).')
        error.statusCode = 400
        throw error
    }

    // Step 2: Calculate total lectures held till today
    const today = new Date()
    const totalLectures = await calculateTotalLectures(
        studentId,
        student.division,
        today,
        student.semesterStartDate
    )

    // Step 3: Count attended lectures from attendance records
    // Exclude any dates that are marked as holidays for this student
    const holidayDates = await holidayService.getHolidayDatesSet(studentId)
    const holidayDateObjects = Array.from(holidayDates).map(dStr => stripTime(dStr))

    const attendedCounts = await Attendance.aggregate([
        {
            $match: {
                studentId: student._id,
                isPresent: true,
                date: { $nin: holidayDateObjects }
            }
        },
        {
            $group: {
                _id: { subject: '$subject', type: '$type' },
                count: { $sum: 1 }
            }
        }
    ])

    // Convert aggregation result to a lookup map
    // { 'DAA_theory': 12, 'DAA_lab': 4, ... }
    const attendedMap = {}
    attendedCounts.forEach(item => {
        const key = `${item._id.subject}_${item._id.type}`
        attendedMap[key] = item.count
    })

    // Step 4: Build the summary response
    const summary = {}
    SUBJECTS.forEach(subject => {
        const theoryAttended = attendedMap[`${subject}_theory`] || 0
        const labAttended = attendedMap[`${subject}_lab`] || 0
        const theoryTotal = totalLectures[subject].theory
        const labTotal = totalLectures[subject].lab

        summary[subject] = {
            theory: {
                attended: theoryAttended,
                total: theoryTotal,
                percentage: theoryTotal > 0
                    ? Math.round((theoryAttended / theoryTotal) * 100 * 100) / 100
                    : 0
            },
            lab: {
                attended: labAttended,
                total: labTotal,
                percentage: labTotal > 0
                    ? Math.round((labAttended / labTotal) * 100 * 100) / 100
                    : 0
            },
            overall: {
                attended: theoryAttended + labAttended,
                total: theoryTotal + labTotal,
                percentage: (theoryTotal + labTotal) > 0
                    ? Math.round(((theoryAttended + labAttended) / (theoryTotal + labTotal)) * 100 * 100) / 100
                    : 0
            }
        }
    })

    return summary
}


// ──────────────────────────────────────────────
// Get Attendance By Date
// Returns all attendance records for a specific date,
// along with what was SCHEDULED for that day.
//
// This is used by the "calendar edit" feature:
// 1. Student clicks a date on the calendar
// 2. Frontend shows which subjects were scheduled
// 3. For each subject, shows present/absent toggle
// ──────────────────────────────────────────────
async function getAttendanceByDate(studentId, date) {
    const student = await Student.findById(studentId).select('division')

    if (!student || !student.division) {
        const error = new Error('Student not found or division not set')
        error.statusCode = 400
        throw error
    }

    const targetDate = stripTime(date)
    const dateStr = targetDate.toISOString().split('T')[0]

    // Check if this date is a holiday
    const isHolidayDate = await holidayService.isHoliday(studentId, targetDate)
    if (isHolidayDate) {
        return {
            date: dateStr,
            isHoliday: true,
            message: 'This date is marked as a holiday',
            records: []
        }
    }

    // Check if within teaching phase
    if (!isTeachingDay(dateStr) || isExamPeriod(dateStr)) {
        return {
            date: dateStr,
            isTeachingDay: false,
            message: 'No lectures scheduled on this date (outside teaching phase or exam period)',
            records: []
        }
    }

    // Get what was scheduled for this date from timetable
    let scheduled = getScheduledSubjects(targetDate, student.division)

    // Get lecture adjustments for this date
    const adjustments = await lectureAdjustmentService.getAdjustmentsForDate(studentId, targetDate)

    // Apply adjustments to scheduled list
    adjustments.forEach(adj => {
        if (adj.adjustment > 0) {
            // Extra lecture: add to scheduled if not already there
            const exists = scheduled.some(s => s.subject === adj.subject && s.type === adj.type)
            if (!exists) {
                scheduled.push({ subject: adj.subject, type: adj.type })
            }
        } else if (adj.adjustment < 0) {
            // Cancelled lecture: remove from scheduled
            scheduled = scheduled.filter(s => !(s.subject === adj.subject && s.type === adj.type))
        }
    })

    // Get existing attendance records for this date
    const existingRecords = await Attendance.find({
        studentId,
        date: targetDate
    })

    // Create a lookup map of existing records
    const recordMap = {}
    existingRecords.forEach(record => {
        const key = `${record.subject}_${record.type}`
        recordMap[key] = record
    })

    // Build the response: for each scheduled subject, include
    // the attendance record if it exists, or show "not marked"
    const records = scheduled.map(({ subject, type }) => {
        const key = `${subject}_${type}`
        const existing = recordMap[key]

        return {
            subject,
            type,
            isPresent: existing ? existing.isPresent : null, // null = not yet marked
            _id: existing ? existing._id : null
        }
    })

    const adjustmentRecords = adjustments.map(adj => ({
        subject: adj.subject,
        type: adj.type,
        adjustment: adj.adjustment,
        reason: adj.reason,
        _id: adj._id
    }))

    return {
        date: dateStr,
        isHoliday: false,
        isTeachingDay: true,
        records,
        adjustments: adjustmentRecords
    }
}


// ──────────────────────────────────────────────
// Toggle Attendance (Mark / Update)
// Creates or updates a single attendance record.
//
// Uses MongoDB's findOneAndUpdate with upsert:
// - If no record exists → creates one
// - If record exists → updates isPresent
//
// This is the "toggle" button in the calendar view.
// ──────────────────────────────────────────────
async function toggleAttendance(studentId, date, subject, type, isPresent) {
    const targetDate = stripTime(date)

    const record = await Attendance.findOneAndUpdate(
        { studentId, date: targetDate, subject, type },
        { isPresent },
        { upsert: true, new: true }
    )

    return record
}


// ──────────────────────────────────────────────
// Bulk Mark Attendance
// Mark multiple subjects at once for a single date.
// Useful when marking all subjects for today at once.
//
// records = [{ subject: 'DAA', type: 'theory', isPresent: true }, ...]
// ──────────────────────────────────────────────
async function bulkMarkAttendance(studentId, date, records) {
    const targetDate = stripTime(date)

    // Use bulkWrite for efficiency — single round-trip to MongoDB
    const operations = records.map(record => ({
        updateOne: {
            filter: {
                studentId,
                date: targetDate,
                subject: record.subject,
                type: record.type
            },
            update: {
                studentId,
                date: targetDate,
                subject: record.subject,
                type: record.type,
                isPresent: record.isPresent
            },
            upsert: true
        }
    }))

    await Attendance.bulkWrite(operations)

    // Return all records for this date after the update
    const updatedRecords = await Attendance.find({
        studentId,
        date: targetDate
    })

    return updatedRecords
}


// ──────────────────────────────────────────────
// Bunk Calculator
// Given a desired attendance percentage, calculates
// how many more lectures the student can skip (bunk)
// per subject while still maintaining that percentage
// by the end of the semester.
//
// FORMULA:
//   totalSemester = totalHeld + totalRemaining
//   requiredAttended = ceil(desiredPercentage * totalSemester / 100)
//   canBunk = (currentAttended + totalRemaining) - requiredAttended
//   canBunk = max(0, canBunk)
//
// The idea: if you attend ALL remaining lectures and still
// have room above the target, the extra room = bunkable lectures.
// ──────────────────────────────────────────────
async function calculateBunkableLectures(studentId, desiredPercentage) {
    const student = await Student.findById(studentId).select('division semesterStartDate')

    if (!student || !student.division) {
        const error = new Error('Student not found or division not set')
        error.statusCode = 400
        throw error
    }

    // Step 1: Get total lectures held till today
    const today = new Date()
    const totalHeld = await calculateTotalLectures(
        studentId,
        student.division,
        today,
        student.semesterStartDate
    )

    // Step 2: Get total lectures in the entire semester
    const totalSemester = await calculateTotalLectures(
        studentId,
        student.division,
        SEMESTER_END_DATE,
        student.semesterStartDate
    )

    // Step 3: Get attended counts excluding holidays
    const holidayDates = await holidayService.getHolidayDatesSet(studentId)
    const holidayDateObjects = Array.from(holidayDates).map(dStr => stripTime(dStr))

    const attendedCounts = await Attendance.aggregate([
        {
            $match: {
                studentId: student._id,
                isPresent: true,
                date: { $nin: holidayDateObjects }
            }
        },
        {
            $group: {
                _id: { subject: '$subject', type: '$type' },
                count: { $sum: 1 }
            }
        }
    ])

    const attendedMap = {}
    attendedCounts.forEach(item => {
        const key = `${item._id.subject}_${item._id.type}`
        attendedMap[key] = item.count
    })

    // Step 4: Calculate bunkable lectures per subject
    const result = {}
    SUBJECTS.forEach(subject => {
        const theoryResult = calculateBunkForType(
            attendedMap[`${subject}_theory`] || 0,
            totalHeld[subject].theory,
            totalSemester[subject].theory,
            desiredPercentage
        )

        const labResult = calculateBunkForType(
            attendedMap[`${subject}_lab`] || 0,
            totalHeld[subject].lab,
            totalSemester[subject].lab,
            desiredPercentage
        )

        // Overall (theory + lab combined)
        const overallAttended = (attendedMap[`${subject}_theory`] || 0) + (attendedMap[`${subject}_lab`] || 0)
        const overallHeld = totalHeld[subject].theory + totalHeld[subject].lab
        const overallSemester = totalSemester[subject].theory + totalSemester[subject].lab
        const overallResult = calculateBunkForType(overallAttended, overallHeld, overallSemester, desiredPercentage)

        result[subject] = {
            theory: theoryResult,
            lab: labResult,
            overall: overallResult
        }
    })

    return {
        desiredPercentage,
        subjects: result
    }
}

// Helper for bunk calculation
function calculateBunkForType(currentAttended, totalHeld, totalSemester, desiredPercentage) {
    const totalRemaining = totalSemester - totalHeld

    // Required attended by end of semester to maintain desired %
    const requiredAttended = Math.ceil(desiredPercentage * totalSemester / 100)

    // If you attend all remaining lectures, your total would be:
    const maxPossibleAttended = currentAttended + totalRemaining

    // The "extra" lectures you can skip:
    const canBunk = Math.max(0, maxPossibleAttended - requiredAttended)

    // Current percentage
    const currentPercentage = totalHeld > 0
        ? Math.round((currentAttended / totalHeld) * 100 * 100) / 100
        : 0

    return {
        attended: currentAttended,
        totalHeld,
        totalSemester,
        remaining: totalRemaining,
        currentPercentage,
        requiredAttended,
        canBunk
    }
}


// ──────────────────────────────────────────────
// Set Semester Start Date
// Updates the student's semester start date.
// This determines from when to start counting lectures.
// ──────────────────────────────────────────────
async function setSemesterStartDate(studentId, date) {
    const student = await Student.findByIdAndUpdate(
        studentId,
        { semesterStartDate: stripTime(date) },
        { new: true }
    ).select('-password')

    if (!student) {
        const error = new Error('Student not found')
        error.statusCode = 404
        throw error
    }

    return student
}


// ──────────────────────────────────────────────
// Get Subject Attendance History
// Returns all attendance records for a specific subject,
// sorted by date descending. Used by the subject detail modal.
// ──────────────────────────────────────────────
async function getSubjectAttendanceHistory(studentId, subject) {
    const student = await Student.findById(studentId).select('division semesterStartDate')

    if (!student || !student.division) {
        const error = new Error('Student not found or division not set')
        error.statusCode = 400
        throw error
    }

    const holidayDates = await holidayService.getHolidayDatesSet(studentId)
    const holidayDateObjects = Array.from(holidayDates).map(dStr => stripTime(dStr))

    // Get all attendance records for this subject excluding holidays
    const records = await Attendance.find({
        studentId,
        subject,
        date: { $nin: holidayDateObjects }
    }).sort({ date: -1 })

    // Format the records
    const history = records.map(record => ({
        _id: record._id,
        date: record.date.toISOString().split('T')[0],
        type: record.type,
        isPresent: record.isPresent
    }))

    // Get totals for this subject
    const today = new Date()
    const totalLectures = await calculateTotalLectures(
        studentId,
        student.division,
        today,
        student.semesterStartDate
    )
    const subjectTotals = totalLectures[subject] || { theory: 0, lab: 0 }

    // Count attended
    const theoryAttended = records.filter(r => r.type === 'theory' && r.isPresent).length
    const labAttended = records.filter(r => r.type === 'lab' && r.isPresent).length

    return {
        subject,
        summary: {
            theory: {
                attended: theoryAttended,
                total: subjectTotals.theory,
                percentage: subjectTotals.theory > 0
                    ? Math.round((theoryAttended / subjectTotals.theory) * 100 * 100) / 100
                    : 0
            },
            lab: {
                attended: labAttended,
                total: subjectTotals.lab,
                percentage: subjectTotals.lab > 0
                    ? Math.round((labAttended / subjectTotals.lab) * 100 * 100) / 100
                    : 0
            },
            overall: {
                attended: theoryAttended + labAttended,
                total: subjectTotals.theory + subjectTotals.lab,
                percentage: (subjectTotals.theory + subjectTotals.lab) > 0
                    ? Math.round(((theoryAttended + labAttended) / (subjectTotals.theory + subjectTotals.lab)) * 100 * 100) / 100
                    : 0
            }
        },
        history
    }
}


module.exports = {
    getSubjectWiseSummary,
    getAttendanceByDate,
    toggleAttendance,
    bulkMarkAttendance,
    calculateBunkableLectures,
    setSemesterStartDate,
    getSubjectAttendanceHistory
}
