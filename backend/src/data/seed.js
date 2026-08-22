// Seed Script
// Purpose: Insert test student data into MongoDB for development/testing.
//
// HOW TO RUN:
//   node src/data/seed.js
//
// This script is meant to be run for TESTING ONLY.
// In production, students create their own accounts via the registration API.
// This script creates pre-registered students with a known password
// so you can test features without going through the registration flow.

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Student = require('../models/student.model')
const Holiday = require('../models/holiday.model')
const studentsData = require('./students.json')
const { DIVISIONS, DEFAULT_HOLIDAYS, SEMESTER_START_DATE } = require('../config/constants')

// Default password for all seeded students (for testing only)
const DEFAULT_PASSWORD = 'password123'

async function seedDatabase() {
    try {
        // Step 1: Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB for seeding')

        // Step 2: Clear existing data
        // We delete everything first so that running the seed script
        // multiple times doesn't create duplicate records.
        await Student.deleteMany({})
        console.log('Cleared existing student data')

        await Holiday.deleteMany({})
        console.log('Cleared existing holiday data')

        // Step 3: Hash the default password once
        // We hash it once and reuse for all students (more efficient)
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

        // Step 4: Prepare student records for insertion
        // Each student gets a division in round-robin fashion
        // and is pre-registered with the default password.
        const studentsToInsert = studentsData.map((student, index) => {
            const division = DIVISIONS[index % DIVISIONS.length]

            return {
                // Academic fields from JSON
                enrollmentNo: student.enrollmentNo,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                gender: student.gender,
                department: student.department,
                semester: student.semester,
                batch: student.batch,
                division: division,
                cgpa: student.cgpa,
                semesterStartDate: new Date(SEMESTER_START_DATE),
                skills: student.skills,
                clubs: student.clubs,
                address: student.address,
                profileImage: student.profileImage,
                isActive: student.isActive,

                // Auth fields — pre-registered for testing
                password: hashedPassword,
                role: 'student',
                lastLogin: null
            }
        })

        // Step 5: Insert all students at once
        // insertMany() is faster than calling create() in a loop
        // because it sends a single batch request to MongoDB.
        const insertedStudents = await Student.insertMany(studentsToInsert)
        console.log(`\nSuccessfully seeded ${insertedStudents.length} students`)
        console.log(`Default password for all: "${DEFAULT_PASSWORD}"`)

        // Step 6: Display the inserted students for verification
        insertedStudents.forEach((student) => {
            console.log(`  ✓ ${student.enrollmentNo} — ${student.firstName} ${student.lastName} (Division: ${student.division})`)
        })

        // Step 7: Seed holidays for each student
        // Each student gets the same set of college-wide holidays.
        console.log('\nSeeding holidays...')
        let holidayCount = 0

        for (const student of insertedStudents) {
            const holidaysToInsert = DEFAULT_HOLIDAYS.map(h => ({
                studentId: student._id,
                date: new Date(h.date),
                reason: h.reason
            }))

            await Holiday.insertMany(holidaysToInsert)
            holidayCount += holidaysToInsert.length
        }

        console.log(`Successfully seeded ${holidayCount} holiday entries (${DEFAULT_HOLIDAYS.length} holidays × ${insertedStudents.length} students)`)

        // Display holidays
        DEFAULT_HOLIDAYS.forEach(h => {
            console.log(`  📅 ${h.date} — ${h.reason}`)
        })

    } catch (error) {
        console.error('Seeding failed:', error.message)
    } finally {
        // Always disconnect after seeding, whether it succeeded or failed.
        // The "finally" block runs regardless of try/catch outcome.
        await mongoose.disconnect()
        console.log('\nDisconnected from MongoDB')
    }
}

// Run the seed function
seedDatabase()
