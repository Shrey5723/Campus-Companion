const mongoose = require('mongoose')
const { DIVISIONS } = require('../config/constants')

// Student Schema
// This model holds both academic information and authentication information
// in a single document. This is because each student has exactly one account,
// so splitting them into two collections would add unnecessary complexity.
//
// REGISTRATION FLOW:
// Students create their own accounts by filling in ALL fields during registration.
// There is no pre-seeding — anyone can register as a new student.
// The seed script exists only for testing/development purposes.

const studentSchema = new mongoose.Schema({

    // ──────────────────────────────────────────────
    // Academic Information
    // These fields are filled by the student during registration.
    // ──────────────────────────────────────────────

    enrollmentNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
        // Example: "23BCE001"
        // This is the primary business identifier for a student.
        // We use this instead of MongoDB's _id in routes and lookups
        // because enrollment numbers are meaningful in a college context.
    },

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
        // lowercase: true ensures that "Shrey@Email.com" and "shrey@email.com"
        // are treated as the same email. This prevents duplicate accounts
        // and makes login case-insensitive for the email field.
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
        // enum restricts the value to one of these options.
        // This prevents invalid data like "xyz" from being stored.
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    semester: {
        type: Number,
        required: true
    },

    batch: {
        type: String,
        trim: true
    },

    division: {
        type: String,
        required: true,
        enum: DIVISIONS
        // Lab division: D1, D2, D3, or D4
        // Determines which subject's lab the student has on each day.
        // The lab rotation varies by division (see config/constants.js).
    },

    cgpa: {
        type: Number,
        default: null
        // CGPA is optional during registration.
        // New students may not have a CGPA yet.
    },

    semesterStartDate: {
        type: Date,
        default: null
        // The date when the current semester started.
        // Used to calculate total lectures held from timetable.
        // Set via API or during registration.
    },

    skills: {
        type: [String],
        default: []
        // Array of strings like ["React", "Node.js"]
        // default: [] means if no skills are provided, it stores an empty array
        // instead of undefined, which makes frontend rendering easier.
    },

    clubs: {
        type: [String],
        default: []
    },

    address: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        fullAddress: { type: String, trim: true },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null }
        // Nested object — Mongoose allows defining sub-documents inline.
        // We don't need a separate Address model because address
        // is always accessed together with the student.
        // fullAddress, latitude, longitude are populated via Geolocation API.
    },

    profileImage: {
        type: String,
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
        // Indicates whether the student is currently enrolled.
        // Useful for soft-deleting students without removing their data.
    },

    // ──────────────────────────────────────────────
    // Authentication Information
    // These fields are set during registration.
    // ──────────────────────────────────────────────

    password: {
        type: String,
        required: true
        // Stored as a bcrypt hash. NEVER stored in plain text.
        // Set during registration.
    },

    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
        // Currently we only have students, but adding 'admin' now
        // makes it easy to add admin features later without changing the model.
    },

    lastLogin: {
        type: Date,
        default: null
        // Tracks when the student last logged in.
        // Useful for analytics and security (detecting inactive accounts).
    }

}, {
    // Mongoose automatically adds createdAt and updatedAt fields
    // and manages them for us on every save/update operation.
    timestamps: true
})

// Create the model from the schema
// "Student" is the model name — Mongoose will create a "students" collection in MongoDB
const Student = mongoose.model('Student', studentSchema)

module.exports = Student