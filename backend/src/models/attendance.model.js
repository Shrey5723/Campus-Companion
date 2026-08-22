const mongoose = require('mongoose')
const { SUBJECTS, LECTURE_TYPES } = require('../config/constants')

// ──────────────────────────────────────────────
// Attendance Schema
// Stores individual day-level attendance records.
//
// Each document = one student's attendance for ONE subject
// on ONE date (either theory or lab).
//
// WHY a separate collection instead of embedding in Student?
// - Attendance records grow over the semester
//   (6 subjects × 2 types × ~90 teaching days = potentially ~1080 records per student)
// - Embedding would make the Student document huge and slow to query
// - Separate collection enables efficient queries like:
//   "get all attendance for DAA" or "get attendance for August only"
// ──────────────────────────────────────────────

const attendanceSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
        // Links this attendance record to a specific student.
        // We use ObjectId (not enrollmentNo) because MongoDB's $lookup
        // and populate work with ObjectId references.
    },

    date: {
        type: Date,
        required: true
        // The date of the lecture (stored as YYYY-MM-DD, time set to 00:00:00 UTC).
        // We strip the time component in the service layer to avoid timezone issues.
    },

    subject: {
        type: String,
        required: true,
        enum: SUBJECTS
        // Must be one of: DAA, CN, FSD, MI, DAV, ML
        // enum validation prevents invalid subjects from being stored.
    },

    type: {
        type: String,
        required: true,
        enum: LECTURE_TYPES
        // 'theory' or 'lab'
        // A subject can have both a theory lecture and a lab on the same day
        // (e.g., Wednesday has CN lab in the morning and MI theory later).
    },

    isPresent: {
        type: Boolean,
        default: true
        // true = student was present, false = absent
        // Default is true because most students mark themselves present
        // and only toggle to absent when needed.
    }

}, {
    timestamps: true
})

// ──────────────────────────────────────────────
// Compound Unique Index
// Ensures that a student can have only ONE attendance record
// per date + subject + type combination.
//
// Without this, calling "toggle" multiple times could create
// duplicate records. With the index, MongoDB prevents duplicates
// and we can use upsert (update if exists, insert if not).
// ──────────────────────────────────────────────
attendanceSchema.index(
    { studentId: 1, date: 1, subject: 1, type: 1 },
    { unique: true }
)

// Additional index for faster queries when fetching attendance by date
attendanceSchema.index({ studentId: 1, date: 1 })

const Attendance = mongoose.model('Attendance', attendanceSchema)

module.exports = Attendance
