const jwt = require('jsonwebtoken')
const Student = require('../models/student.model')

// Protect middleware
// This middleware checks if the user is logged in before allowing access
// to protected routes. It runs BEFORE the controller.
//
// HOW IT WORKS:
// 1. When a student logs in, we set a JWT inside an HTTP-only cookie.
// 2. The browser automatically sends this cookie with every request.
// 3. This middleware reads the cookie, verifies the JWT, and finds the student.
// 4. If everything is valid, it attaches the student to req.student
//    so the controller can access the logged-in student's data.
// 5. If anything fails, it sends a 401 Unauthorized response.

async function protect(req, res, next) {
    try {
        // Step 1: Get the token from the cookie
        // cookie-parser middleware (configured in app.js) parses all cookies
        // and makes them available at req.cookies
        const token = req.cookies.token

        // If no token exists, the student is not logged in
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.'
            })
        }

        // Step 2: Verify the token
        // jwt.verify() checks two things:
        //   a) The token was signed with our secret key (not tampered with)
        //   b) The token hasn't expired
        // If either check fails, it throws an error.
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Step 3: Find the student using the id stored in the token
        // We exclude the password field for security.
        const student = await Student.findById(decoded.id).select('-password')

        // The student might have been deleted after the token was issued
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Student no longer exists'
            })
        }

        // Step 4: Attach the student to the request object
        // Now any controller that runs after this middleware
        // can access the logged-in student via req.student
        req.student = student

        // Step 5: Move to the next middleware or controller
        next()

    } catch (error) {
        // If jwt.verify() fails (invalid or expired token), we end up here
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Invalid or expired token.'
        })
    }
}

module.exports = { protect }
