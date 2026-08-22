import api from './axios'

// ──────────────────────────────────────────────
// Holiday API
// CRUD operations for holidays
// ──────────────────────────────────────────────

export const holidayAPI = {
    // GET /attendance/holidays — Get all holidays
    getHolidays: () => {
        return api.get('/attendance/holidays')
    },

    // POST /attendance/holidays — Add a holiday
    addHoliday: (date, reason) => {
        return api.post('/attendance/holidays', { date, reason })
    },

    // DELETE /attendance/holidays/:date — Remove a holiday
    removeHoliday: (date) => {
        return api.delete(`/attendance/holidays/${date}`)
    }
}
