const express = require('express')
const studentController = require('../controllers/student.controller')
const { protect } = require('../middleware/auth.middleware')

const studentRouter = express.Router()

// PUT /api/students/profile — Update own profile (Protected)
// Must be defined BEFORE /:enrollmentNo to avoid path collision
studentRouter.put('/profile', protect, studentController.updateProfile)

// GET /api/students — Get all students (Protected)
// The protect middleware runs first. If authorized, it passes control to the controller.
studentRouter.get('/', protect, studentController.getAllStudents)

// GET /api/students/:enrollmentNo — Get a single student by enrollment number (Protected)
studentRouter.get('/:enrollmentNo', protect, studentController.getStudentByEnrollmentNo)

module.exports = studentRouter