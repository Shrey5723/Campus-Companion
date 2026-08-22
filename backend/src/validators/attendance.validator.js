const { SUBJECTS, LECTURE_TYPES, DIVISIONS } = require('../config/constants')

// ──────────────────────────────────────────────
// Attendance Validators
// Validate request data BEFORE it reaches the controller.
// Same pattern as auth.validator.js — Express middleware
// that runs between the route and the controller.
// ──────────────────────────────────────────────

// Validate toggle attendance request
// Body: { date, subject, type, isPresent }
function validateToggle(req, res, next) {
    const { date, subject, type, isPresent } = req.body

    if (!date || !subject || !type || isPresent === undefined) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: date, subject, type, isPresent'
        })
    }

    // Validate date
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    // Date should not be in the future
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (parsedDate > today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot mark attendance for a future date'
        })
    }

    // Validate subject
    if (!SUBJECTS.includes(subject)) {
        return res.status(400).json({
            success: false,
            message: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}`
        })
    }

    // Validate type
    if (!LECTURE_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid type. Must be one of: ${LECTURE_TYPES.join(', ')}`
        })
    }

    // Validate isPresent is boolean
    if (typeof isPresent !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'isPresent must be a boolean (true or false)'
        })
    }

    next()
}


// Validate bulk mark attendance request
// Body: { date, records: [{ subject, type, isPresent }] }
function validateBulkMark(req, res, next) {
    const { date, records } = req.body

    if (!date || !records) {
        return res.status(400).json({
            success: false,
            message: 'Both date and records are required'
        })
    }

    // Validate date
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    // Date should not be in the future
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (parsedDate > today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot mark attendance for a future date'
        })
    }

    // Validate records is an array
    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'records must be a non-empty array'
        })
    }

    // Validate each record
    for (const record of records) {
        if (!record.subject || !record.type || record.isPresent === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Each record must have: subject, type, isPresent'
            })
        }

        if (!SUBJECTS.includes(record.subject)) {
            return res.status(400).json({
                success: false,
                message: `Invalid subject "${record.subject}". Must be one of: ${SUBJECTS.join(', ')}`
            })
        }

        if (!LECTURE_TYPES.includes(record.type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid type "${record.type}". Must be one of: ${LECTURE_TYPES.join(', ')}`
            })
        }

        if (typeof record.isPresent !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isPresent must be a boolean (true or false)'
            })
        }
    }

    next()
}


// Validate bunk calculator request
// Query: ?percentage=75
function validateBunkCalculator(req, res, next) {
    const { percentage } = req.query

    if (!percentage) {
        return res.status(400).json({
            success: false,
            message: 'percentage query parameter is required (e.g., ?percentage=75)'
        })
    }

    const parsedPercentage = parseFloat(percentage)
    if (isNaN(parsedPercentage) || parsedPercentage < 1 || parsedPercentage > 100) {
        return res.status(400).json({
            success: false,
            message: 'percentage must be a number between 1 and 100'
        })
    }

    next()
}


// Validate date parameter in URL
// Params: :date (format YYYY-MM-DD)
function validateDateParam(req, res, next) {
    const { date } = req.params

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    next()
}


// Validate holiday request
// Body: { date, reason? }
function validateHoliday(req, res, next) {
    const { date } = req.body

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'date is required'
        })
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    next()
}


// Validate semester start date request
// Body: { date }
function validateSemesterStart(req, res, next) {
    const { date } = req.body

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'date is required'
        })
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    next()
}


// Validate lecture adjustment request
// Body: { date, subject, type, adjustment, reason? }
function validateLectureAdjustment(req, res, next) {
    const { date, subject, type, adjustment } = req.body

    if (!date || !subject || !type || adjustment === undefined) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: date, subject, type, adjustment'
        })
    }

    // Validate date
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD.'
        })
    }

    // Validate subject
    if (!SUBJECTS.includes(subject)) {
        return res.status(400).json({
            success: false,
            message: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}`
        })
    }

    // Validate type
    if (!LECTURE_TYPES.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid type. Must be one of: ${LECTURE_TYPES.join(', ')}`
        })
    }

    // Validate adjustment is +1 or -1
    if (adjustment !== 1 && adjustment !== -1) {
        return res.status(400).json({
            success: false,
            message: 'adjustment must be 1 (extra lecture) or -1 (cancelled lecture)'
        })
    }

    next()
}


module.exports = {
    validateToggle,
    validateBulkMark,
    validateBunkCalculator,
    validateDateParam,
    validateHoliday,
    validateSemesterStart,
    validateLectureAdjustment
}
