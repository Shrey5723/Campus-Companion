import api from './axios'

// ──────────────────────────────────────────────
// Auth API
// POST /auth/login — Login with email + password
// POST /auth/register — Register a new student
// ──────────────────────────────────────────────

export const authAPI = {
    login: (email, password) => {
        return api.post('/auth/login', { email, password })
    },

    register: (studentData) => {
        return api.post('/auth/register', studentData)
    }
}
