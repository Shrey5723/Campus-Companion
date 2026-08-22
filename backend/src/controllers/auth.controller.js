const authService = require('../services/auth.service')
const { generateToken } = require('../utils/generateToken')

// Register a student
// The controller's job is simple:
// 1. Extract data from the request
// 2. Call the service
// 3. Send the response
// All the actual logic (finding student, hashing password, etc.) lives in the service.
async function register(req, res) {
    try {
        // Pass the entire request body to the service.
        // The validator has already checked all required fields,
        // so we can safely forward everything.
        const student = await authService.registerStudent(req.body)

        // Generate JWT for automatic login after registration
        // Students shouldn't have to log in separately after registering.
        const token = generateToken(student)

        // Set JWT in an HTTP-only cookie
        // WHY HTTP-only cookie instead of localStorage?
        // - HTTP-only cookies CANNOT be accessed by JavaScript (document.cookie won't see it)
        // - This protects against XSS attacks (Cross-Site Scripting)
        // - The browser automatically sends the cookie with every request
        // - localStorage is accessible by any JavaScript on the page, making it vulnerable
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        })

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: student
        })

    } catch (error) {
        // The service throws errors with statusCode attached
        // We use that statusCode here, or fall back to 500 if none is set
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Registration failed'
        })
    }
}

// Login a student
async function login(req, res) {
    try {
        const { email, password } = req.body

        // Call the auth service to handle login logic
        const student = await authService.loginStudent(email, password)

        // Generate JWT
        const token = generateToken(student)

        // Set JWT in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        })

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: student
        })

    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Login failed'
        })
    }
}

module.exports = {
    register,
    login
}
