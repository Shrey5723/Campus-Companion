const mongoose = require('mongoose')
const { SUBJECTS, LECTURE_TYPES } = require('../config/constants')

// ──────────────────────────────────────────────
// Lecture Adjustment Schema
// Stores per-student lecture overrides for specific dates.
//
// USE CASES:
// - Teacher took an extra class → adjustment = +1
// - Teacher cancelled a class → adjustment = -1
//
// These adjustments modify the "total lectures held" count
// used in attendance percentage calculations.
// ──────────────────────────────────────────────

const lectureAdjustmentSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    date: {
        type: Date,
        required: true
        // The date of the adjustment (YYYY-MM-DD, time at 00:00:00 UTC)
    },

    subject: {
        type: String,
        required: true,
        enum: SUBJECTS
        // Must be one of: DAA, CN, FSD, MI, DAV, ML
    },

    type: {
        type: String,
        required: true,
        enum: LECTURE_TYPES
        // 'theory' or 'lab'
    },

    adjustment: {
        type: Number,
        required: true,
        enum: [1, -1]
        // +1 = extra lecture taken by teacher
        // -1 = scheduled lecture was cancelled
    },

    reason: {
        type: String,
        trim: true,
        default: ''
        // Optional reason like "Extra class by DAA teacher"
    }

}, {
    timestamps: true
})

// Compound unique index: one adjustment per subject+type per date per student
// If the teacher takes an extra AND cancels on the same day for the same
// subject+type, the net effect is 0 — user should remove the adjustment instead.
lectureAdjustmentSchema.index(
    { studentId: 1, date: 1, subject: 1, type: 1 },
    { unique: true }
)

// Index for efficient date-range queries used by calculateTotalLectures
lectureAdjustmentSchema.index({ studentId: 1, date: 1 })

const LectureAdjustment = mongoose.model('LectureAdjustment', lectureAdjustmentSchema)

module.exports = LectureAdjustment
