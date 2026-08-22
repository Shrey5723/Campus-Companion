const Student = require('../models/student.model')

// Get all students
// .select('-password') excludes the password field from the results.
// The minus sign (-) before a field name tells Mongoose to exclude it.
// We NEVER want to send passwords to the frontend, even if they are hashed.
const getAllStudents = async () => {
    const students = await Student.find().select('-password')
    return students
}

// Get student by enrollment number
// We use enrollmentNo instead of MongoDB's _id because enrollment numbers
// are meaningful in a college context — students know their enrollment number
// but they don't know their MongoDB ObjectId.
const getStudentByEnrollmentNo = async (enrollmentNo) => {
    const student = await Student.findOne({ enrollmentNo }).select('-password')
    return student
}

// Update student profile
// Only allows updating specific fields that students should be able to edit.
// Sensitive fields (password, role, enrollmentNo) are NOT updatable here.
const updateStudentProfile = async (studentId, updateData) => {
    // Whitelist of editable fields
    const allowedFields = [
        'firstName', 'lastName', 'phone', 'gender',
        'department', 'semester', 'division', 'batch',
        'cgpa', 'skills', 'clubs', 'address', 'profileImage'
    ]

    const sanitized = {}
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            sanitized[field] = updateData[field]
        }
    })

    const student = await Student.findByIdAndUpdate(
        studentId,
        sanitized,
        { new: true, runValidators: true }
    ).select('-password')

    if (!student) {
        const error = new Error('Student not found')
        error.statusCode = 404
        throw error
    }

    return student
}

module.exports = {
    getAllStudents,
    getStudentByEnrollmentNo,
    updateStudentProfile
}