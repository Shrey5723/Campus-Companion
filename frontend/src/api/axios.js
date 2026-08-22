import axios from 'axios'

// ──────────────────────────────────────────────
// Axios Instance
// Centralized HTTP client with:
// - Base URL pointing to the backend API
// - Credentials included for cookie-based auth
// - Response interceptor for 401 handling
// ──────────────────────────────────────────────

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // If we get a 401 and we're not on the login page,
            // redirect to login
            const isAuthRoute = window.location.pathname === '/login' ||
                                window.location.pathname === '/register'
            if (!isAuthRoute) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
