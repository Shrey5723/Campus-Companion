const studentService = require('../services/student.service')

// Get all students
// Controller only receives the request, calls the service, and sends the response.
// No database logic or business logic lives here.
async function getAllStudents(req, res) {
    try {
        const students = await studentService.getAllStudents()

        return res.status(200).json({
            success: true,
            message: 'Students fetched successfully',
            count: students.length,
            data: students
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch students'
        })
    }
}

// Get student by enrollment number
// We use enrollment number as the identifier in the URL (e.g., /api/students/23BCE001)
// because it is the natural business identifier that students and staff recognize.
async function getStudentByEnrollmentNo(req, res) {
    try {
        const enrollmentNo = req.params.enrollmentNo

        const student = await studentService.getStudentByEnrollmentNo(enrollmentNo)

        // If no student is found with this enrollment number
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Student fetched successfully',
            data: student
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student'
        })
    }
}

// Update student profile
// Uses req.student._id from the protect middleware (JWT auth)
// so students can only update their own profile.
async function updateProfile(req, res) {
    try {
        const student = await studentService.updateStudentProfile(
            req.student._id, req.body
        )

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: student
        })
    } catch (error) {
        const statusCode = error.statusCode || 500
        return res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to update profile'
        })
    }
}

module.exports = {
    getAllStudents,
    getStudentByEnrollmentNo,
    updateProfile
}
