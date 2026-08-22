const { DIVISIONS } = require('../config/constants')

// Auth Validator
// Purpose: Validate request data BEFORE it reaches the controller/service.
//
// WHY separate validation?
// 1. Controllers stay thin — they don't need to check every field manually.
// 2. Validation logic is reusable — if multiple routes need the same checks,
//    we write it once here.
// 3. Cleaner error messages — we can return specific messages for each field
//    instead of letting MongoDB throw confusing errors.
//
// These are Express middleware functions. They run BETWEEN the route and
// the controller. If validation fails, they send an error response and
// the controller never runs.

// Validate registration request
// The student must fill in all their academic + auth information.
function validateRegister(req, res, next) {
    const {
        enrollmentNo,
        firstName,
        lastName,
        email,
        phone,
        gender,
        department,
        semester,
        division,
        password,
        confirmPassword
    } = req.body

    // ── Required field checks ──
    // These fields are mandatory for creating a student account.
    const requiredFields = {
        enrollmentNo, firstName, lastName, email, phone,
        gender, department, semester, division,
        password, confirmPassword
    }

    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key)

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`
        })
    }

    // ── Enrollment Number validation ──
    // Must be a non-empty string (e.g., "23BCE001")
    if (typeof enrollmentNo !== 'string' || enrollmentNo.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Enrollment number must be a non-empty string'
        })
    }

    // ── Name validation ──
    if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'First name must be at least 2 characters long'
        })
    }

    if (typeof lastName !== 'string' || lastName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Last name must be at least 2 characters long'
        })
    }

    // ── Email validation ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        })
    }

    // ── Phone validation ──
    // Accept 10-digit Indian phone numbers (with or without country code)
    const phoneStr = String(phone || '').replace(/\s|-/g, '')
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/
    if (!phoneRegex.test(phoneStr)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid 10-digit phone number'
        })
    }

    // ── Gender validation ──
    if (!['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({
            success: false,
            message: 'Gender must be one of: Male, Female, Other'
        })
    }

    // ── Semester validation ──
    const semesterNum = Number(semester)
    if (!Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return res.status(400).json({
            success: false,
            message: 'Semester must be an integer between 1 and 8'
        })
    }

    // ── Division validation ──
    if (!DIVISIONS.includes(division)) {
        return res.status(400).json({
            success: false,
            message: `Division must be one of: ${DIVISIONS.join(', ')}`
        })
    }

    // ── Password validation ──
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Password and Confirm Password do not match'
        })
    }

    // ── Optional field validation ──

    // CGPA (optional but must be valid if provided)
    if (req.body.cgpa !== undefined && req.body.cgpa !== null) {
        const cgpa = Number(req.body.cgpa)
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            return res.status(400).json({
                success: false,
                message: 'CGPA must be a number between 0 and 10'
            })
        }
    }

    // Skills (optional but must be an array if provided)
    if (req.body.skills !== undefined && !Array.isArray(req.body.skills)) {
        return res.status(400).json({
            success: false,
            message: 'Skills must be an array of strings'
        })
    }

    // Clubs (optional but must be an array if provided)
    if (req.body.clubs !== undefined && !Array.isArray(req.body.clubs)) {
        return res.status(400).json({
            success: false,
            message: 'Clubs must be an array of strings'
        })
    }

    // Address (optional but must be an object if provided)
    if (req.body.address !== undefined && typeof req.body.address !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Address must be an object with city and state fields'
        })
    }

    // If all checks pass, move to the next middleware (the controller)
    next()
}

// Validate login request
function validateLogin(req, res, next) {
    const { email, password } = req.body

    // Check that both fields are present
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        })
    }

    // If all checks pass, move to the next middleware (the controller)
    next()
}

module.exports = {
    validateRegister,
    validateLogin
}
