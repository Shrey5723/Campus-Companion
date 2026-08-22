import api from './axios'

// ──────────────────────────────────────────────
// Attendance API
// All endpoints are protected (cookie-based JWT)
// ──────────────────────────────────────────────

export const attendanceAPI = {
    // GET /attendance/summary — Subject-wise attendance dashboard
    getSummary: () => {
        return api.get('/attendance/summary')
    },

    // GET /attendance/date/:date — Attendance for a specific date
    getByDate: (date) => {
        return api.get(`/attendance/date/${date}`)
    },

    // PUT /attendance/toggle — Toggle present/absent
    toggleAttendance: ({ date, subject, type, isPresent }) => {
        return api.put('/attendance/toggle', { date, subject, type, isPresent })
    },

    // POST /attendance/bulk — Mark multiple subjects at once
    bulkMark: ({ date, records }) => {
        return api.post('/attendance/bulk', { date, records })
    },

    // GET /attendance/bunk-calculator?percentage=75
    calculateBunks: (percentage) => {
        return api.get(`/attendance/bunk-calculator?percentage=${percentage}`)
    },

    // PUT /attendance/semester-start — Set semester start date
    setSemesterStart: (date) => {
        return api.put('/attendance/semester-start', { date })
    },

    // POST /attendance/adjustments — Add a lecture adjustment
    addLectureAdjustment: ({ date, subject, type, adjustment, reason }) => {
        return api.post('/attendance/adjustments', { date, subject, type, adjustment, reason })
    },

    // DELETE /attendance/adjustments — Remove a lecture adjustment
    removeLectureAdjustment: ({ date, subject, type }) => {
        return api.delete('/attendance/adjustments', { data: { date, subject, type } })
    },

    // GET /attendance/adjustments — Get all lecture adjustments
    getLectureAdjustments: () => {
        return api.get('/attendance/adjustments')
    },

    // GET /attendance/subject/:subject — Get subject attendance history
    getSubjectHistory: (subject) => {
        return api.get(`/attendance/subject/${subject}`)
    }
}
