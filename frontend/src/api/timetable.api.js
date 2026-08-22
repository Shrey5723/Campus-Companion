import api from './axios'

// ──────────────────────────────────────────────
// Timetable API
// GET /attendance/timetable — Weekly timetable
// ──────────────────────────────────────────────

export const timetableAPI = {
    getTimetable: () => {
        return api.get('/attendance/timetable')
    }
}
