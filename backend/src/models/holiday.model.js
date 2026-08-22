const mongoose = require('mongoose')

// ──────────────────────────────────────────────
// Holiday Schema
// Stores dates when no lectures happen (per student).
//
// WHY per-student instead of global?
// While college holidays are the same for everyone,
// a student might want to mark personal off-days
// (e.g., medical leave) where they shouldn't be counted
// as absent — they should be excluded from the total count.
//
// The seed script pre-populates college-wide holidays.
// Students can add more via the API.
// ──────────────────────────────────────────────

const holidaySchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    date: {
        type: Date,
        required: true
        // The holiday date (stored as YYYY-MM-DD, time at 00:00:00 UTC)
    },

    reason: {
        type: String,
        trim: true,
        default: ''
        // Optional reason like "Independence Day", "Medical Leave"
        // Helpful for the frontend to show why a day was excluded.
    }

}, {
    timestamps: true
})

// Unique index: one holiday entry per date per student
// Prevents a student from marking the same date as holiday twice.
holidaySchema.index(
    { studentId: 1, date: 1 },
    { unique: true }
)

const Holiday = mongoose.model('Holiday', holidaySchema)

module.exports = Holiday
