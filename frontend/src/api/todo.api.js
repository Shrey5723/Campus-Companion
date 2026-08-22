import api from './axios'

// ──────────────────────────────────────────────
// Todo API
// All endpoints are protected (cookie-based JWT)
// ──────────────────────────────────────────────

export const todoAPI = {
    // GET /todos — List todos with optional filters
    getTodos: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.filter) queryParams.append('filter', params.filter)
        if (params.sort) queryParams.append('sort', params.sort)
        if (params.search) queryParams.append('search', params.search)
        const queryString = queryParams.toString()
        return api.get(`/todos${queryString ? `?${queryString}` : ''}`)
    },

    // GET /todos/stats — Get aggregate stats
    getStats: () => {
        return api.get('/todos/stats')
    },

    // POST /todos — Create a new todo
    createTodo: (data) => {
        return api.post('/todos', data)
    },

    // PUT /todos/:id — Update a todo
    updateTodo: (id, data) => {
        return api.put(`/todos/${id}`, data)
    },

    // DELETE /todos/:id — Delete a todo
    deleteTodo: (id) => {
        return api.delete(`/todos/${id}`)
    },

    // PATCH /todos/:id/toggle — Toggle complete/pending
    toggleComplete: (id) => {
        return api.patch(`/todos/${id}/toggle`)
    },

    // PATCH /todos/:id/important — Toggle important flag
    toggleImportant: (id) => {
        return api.patch(`/todos/${id}/important`)
    },

    // PATCH /todos/:id/subtasks/:subtaskId/toggle — Toggle subtask
    toggleSubtask: (id, subtaskId) => {
        return api.patch(`/todos/${id}/subtasks/${subtaskId}/toggle`)
    }
}
