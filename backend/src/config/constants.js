// ──────────────────────────────────────────────
// Constants
// Centralized configuration for the attendance system.
// All subjects, timetable data, and semester info live here.
// ──────────────────────────────────────────────

// The 6 subjects for Semester 5 (Branch: 5BCED)
const SUBJECTS = ['DAA', 'CN', 'FSD', 'MI', 'DAV', 'ML']

// Lecture types
const LECTURE_TYPES = ['theory', 'lab']

// Total lectures per subject per semester
const MAX_THEORY_LECTURES = 45  // 3 per week × 15 weeks
const MAX_LAB_LECTURES = 15     // 1 per week × 15 weeks

// Valid divisions for lab rotation
const DIVISIONS = ['D1', 'D2', 'D3', 'D4']

// ──────────────────────────────────────────────
// Weekly Theory Schedule
// Parsed from the Branch 5BCED timetable.
// Theory lectures are the SAME for all divisions.
// Each day lists the subjects that have a theory lecture.
// ──────────────────────────────────────────────
const THEORY_SCHEDULE = {
    monday:    ['CN', 'ML', 'MI', 'DAA'],    // CN(7:45), ML(8:40), MI(12:35), DAA(1:30)
    tuesday:   ['ML', 'CN', 'MI', 'FSD'],    // ML(7:45), CN(8:40), MI(9:50), FSD(10:45)
    wednesday: ['DAV', 'MI'],                  // DAV(9:50 EL1), MI(10:45)
    thursday:  ['ML', 'DAA', 'DAV', 'FSD'],   // ML(9:50), DAA(10:45), DAV(11:40 EL1), FSD(1:30)
    friday:    ['CN', 'DAA', 'DAV', 'FSD'],   // CN(7:45), DAA(8:40), DAV(11:40 EL1), FSD(1:30)
    saturday:  [],                              // No classes on Saturday
    sunday:    []                                // No classes on Sunday
}

// ──────────────────────────────────────────────
// Weekly Lab Schedule (Division-wise)
// Labs are 2-hour blocks. Each division does a different
// subject's lab on each day. This rotation is parsed from
// the timetable image.
//
// Format: { day: subject }
// DAV lab is on Wednesday afternoon for ALL divisions.
// The other 5 labs rotate across Mon/Tue/Wed-morning/Thu/Fri.
// ──────────────────────────────────────────────
const LAB_SCHEDULE = {
    D1: {
        monday:    'MI',    // MI UDP W5112 D1
        tuesday:   'CN',    // CN MP W505 D1
        wednesday: ['DAA', 'DAV'],  // DAA JBB W504 D1 (morning) + DAV lab (afternoon)
        thursday:  'ML',    // ML SM W5061 D1
        friday:    'FSD',   // FSD BBS W5111 D1
        saturday:  null,
        sunday:    null
    },
    D2: {
        monday:    'CN',    // CN USB W408A D2
        tuesday:   'MI',    // MI SU W408A D2
        wednesday: ['ML', 'DAV'],  // ML BBS W502 D2 (morning) + DAV lab (afternoon)
        thursday:  'FSD',   // FSD JJP W5063 D2
        friday:    'DAA',   // DAA DR W503 D2
        saturday:  null,
        sunday:    null
    },
    D3: {
        monday:    'DAA',   // DAA DR W5063 D3
        tuesday:   'FSD',   // FSD JJP W409A D3 (NOTE: from the lab slot entries)
        wednesday: ['CN', 'DAV'],   // CN USB W508 D3 (morning) + DAV lab (afternoon)
        thursday:  'MI',    // MI BS W408A D3
        friday:    'ML',    // ML NP W5065 D3
        saturday:  null,
        sunday:    null
    },
    D4: {
        monday:    'DAA',   // DAA MP W5065 D4
        tuesday:   'FSD',   // FSD SG W5066 D4
        wednesday: ['CN', 'DAV'],   // CN LP W5111 D4 (morning) + DAV lab (afternoon)
        thursday:  'ML',    // ML NP W508 D4
        friday:    'MI',    // MI SU W408 D4
        saturday:  null,
        sunday:    null
    }
}

// ──────────────────────────────────────────────
// Semester Dates (from Nirma University Academic Calendar)
// Odd Term 2026-2027: July 2026 to November 2026
// ──────────────────────────────────────────────
const SEMESTER_START_DATE = '2026-07-06'  // Semester commencement
const SEMESTER_END_DATE = '2026-11-02'    // Semester end

// Teaching phases (lectures happen during these periods)
const TEACHING_PHASES = [
    { start: '2026-07-06', end: '2026-09-07', name: 'Teaching Phase I' },
    { start: '2026-09-14', end: '2026-11-02', name: 'Teaching Phase II' }
]

// Non-teaching periods (no lectures, excluded from attendance count)
const EXAM_PERIODS = [
    { start: '2026-09-08', end: '2026-09-11', name: 'Sessional Examination' }
    // LPW (23-10 to 30-10) says "Teaching Conti.." so teaching continues
]

// ──────────────────────────────────────────────
// Pre-defined Holidays (from Academic Calendar)
// These dates have NO lectures — excluded from attendance counting.
// ──────────────────────────────────────────────
const DEFAULT_HOLIDAYS = [
    { date: '2026-08-15', reason: 'Independence Day' },
    { date: '2026-08-28', reason: 'Rakshabandhan' },
    { date: '2026-09-04', reason: 'Janmashtami' },
    { date: '2026-09-15', reason: 'Samvatsari / Ganesh Chaturthi' },
    { date: '2026-10-02', reason: 'Mahatma Gandhi Birthday' },
    { date: '2026-10-03', reason: 'Foundation Day' },
    { date: '2026-10-20', reason: 'Dussehra (Vijya Dashmi)' }
    // Guru Nanak's Birthday (24-11-2026) falls after semester end
    // Diwali Vacation (06-11 to 13-11) falls after semester end
]

module.exports = {
    SUBJECTS,
    LECTURE_TYPES,
    MAX_THEORY_LECTURES,
    MAX_LAB_LECTURES,
    DIVISIONS,
    THEORY_SCHEDULE,
    LAB_SCHEDULE,
    SEMESTER_START_DATE,
    SEMESTER_END_DATE,
    TEACHING_PHASES,
    EXAM_PERIODS,
    DEFAULT_HOLIDAYS
}
