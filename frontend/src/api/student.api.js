import api from './axios'

// ──────────────────────────────────────────────
// Student API
// Protected endpoints for student data
// ──────────────────────────────────────────────

export const studentAPI = {
    // GET /students — Get all students
    getAll: () => {
        return api.get('/students')
    },

    // GET /students/:enrollmentNo — Get single student
    getByEnrollment: (enrollmentNo) => {
        return api.get(`/students/${enrollmentNo}`)
    },

    // PUT /students/profile — Update own profile
    updateProfile: (data) => {
        return api.put('/students/profile', data)
    }
}
