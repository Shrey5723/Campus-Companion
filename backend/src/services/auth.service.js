const bcrypt = require('bcrypt')
const Student = require('../models/student.model')
const { SEMESTER_START_DATE } = require('../config/constants')

// Register a student
// OPEN REGISTRATION: Creates a brand new student account.
// The student fills in ALL their details during registration.
// No pre-seeding required.
//
// WHY this design?
// This is a self-service portal where any student can create
// their own account. All academic information (enrollment number,
// department, division, etc.) is provided by the student.
async function registerStudent(studentData) {

    // Step 1: Check if a student with this enrollment number already exists
    const existingByEnrollment = await Student.findOne({
        enrollmentNo: studentData.enrollmentNo
    })

    if (existingByEnrollment) {
        const error = new Error('An account with this enrollment number already exists. Please login.')
        error.statusCode = 409 // 409 = Conflict
        throw error
    }

    // Step 2: Check if a student with this email already exists
    const existingByEmail = await Student.findOne({
        email: studentData.email
    })

    if (existingByEmail) {
        const error = new Error('An account with this email already exists. Please login.')
        error.statusCode = 409
        throw error
    }

    // Step 3: Hash the password
    // bcrypt.hash() converts the plain text password into an irreversible hash.
    // The second argument (10) is the "salt rounds" — how many times the hash
    // algorithm runs. Higher = more secure but slower. 10 is the standard.
    const hashedPassword = await bcrypt.hash(studentData.password, 10)

    // Step 4: Create the new student document
    // All fields come from the registration form.
    // Some optional fields get defaults from the schema if not provided.
    const student = new Student({
        // Required fields
        enrollmentNo: studentData.enrollmentNo,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone,
        gender: studentData.gender,
        department: studentData.department,
        semester: studentData.semester,
        division: studentData.division,
        password: hashedPassword,

        // Optional fields (use provided value or schema default)
        batch: studentData.batch || null,
        cgpa: studentData.cgpa || null,
        semesterStartDate: studentData.semesterStartDate || SEMESTER_START_DATE,
        skills: studentData.skills || [],
        clubs: studentData.clubs || [],
        address: studentData.address || {},
        profileImage: studentData.profileImage || null,

        // System fields
        role: 'student',
        lastLogin: new Date()
    })

    await student.save()

    // Step 5: Return the student WITHOUT the password
    // .toObject() converts the Mongoose document to a plain JavaScript object
    // so we can delete properties from it.
    // We never send the password to the frontend, even if it's hashed.
    const responseData = student.toObject()
    delete responseData.password

    return responseData
}

// Login a student
async function loginStudent(email, password) {

    // Step 1: Find the student by email
    // Unlike registration, we only need the email for login.
    const student = await Student.findOne({ email })

    // We intentionally use a vague error message ("Invalid email or password")
    // instead of "Email not found" or "Wrong password".
    // WHY? If we said "Email not found", an attacker would know that email
    // doesn't have an account. By being vague, we don't reveal which part
    // of the credentials is wrong.
    if (!student) {
        const error = new Error('Invalid email or password')
        error.statusCode = 401
        throw error
    }

    // Step 2: Compare the provided password with the stored hash
    // bcrypt.compare() hashes the input and compares it with the stored hash.
    // It returns true if they match, false otherwise.
    // We NEVER compare plain text passwords directly.
    const isPasswordCorrect = await bcrypt.compare(password, student.password)

    if (!isPasswordCorrect) {
        const error = new Error('Invalid email or password')
        error.statusCode = 401
        throw error
    }

    // Step 3: Update last login time
    student.lastLogin = new Date()
    await student.save()

    // Step 4: Return student data without the password
    const studentData = student.toObject()
    delete studentData.password

    return studentData
}

module.exports = {
    registerStudent,
    loginStudent
}
