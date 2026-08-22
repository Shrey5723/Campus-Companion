import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { todoAPI } from '../api/todo.api'

// ──────────────────────────────────────────────
// Todo Slice
// Manages: todos list, stats, filters, sorting, search
// ──────────────────────────────────────────────

// ─── Async Thunks ───

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async ({ filter, sort, search } = {}, { rejectWithValue }) => {
        try {
            const response = await todoAPI.getTodos({ filter, sort, search })
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch tasks'
            )
        }
    }
)

export const fetchTodoStats = createAsyncThunk(
    'todos/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await todoAPI.getStats()
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch stats'
            )
        }
    }
)

export const createTodo = createAsyncThunk(
    'todos/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await todoAPI.createTodo(data)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create task'
            )
        }
    }
)

export const updateTodo = createAsyncThunk(
    'todos/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await todoAPI.updateTodo(id, data)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update task'
            )
        }
    }
)

export const deleteTodo = createAsyncThunk(
    'todos/delete',
    async (id, { rejectWithValue }) => {
        try {
            await todoAPI.deleteTodo(id)
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete task'
            )
        }
    }
)

export const toggleComplete = createAsyncThunk(
    'todos/toggleComplete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await todoAPI.toggleComplete(id)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle task'
            )
        }
    }
)

export const toggleImportant = createAsyncThunk(
    'todos/toggleImportant',
    async (id, { rejectWithValue }) => {
        try {
            const response = await todoAPI.toggleImportant(id)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle importance'
            )
        }
    }
)

export const toggleSubtask = createAsyncThunk(
    'todos/toggleSubtask',
    async ({ todoId, subtaskId }, { rejectWithValue }) => {
        try {
            const response = await todoAPI.toggleSubtask(todoId, subtaskId)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle subtask'
            )
        }
    }
)

// ─── Slice ───

const todoSlice = createSlice({
    name: 'todos',
    initialState: {
        todos: [],
        stats: null,
        loading: false,
        statsLoading: false,
        createLoading: false,
        error: null,
        activeFilter: 'all',
        sortBy: 'createdAt',
        searchQuery: ''
    },
    reducers: {
        setFilter: (state, action) => {
            state.activeFilter = action.payload
        },
        setSort: (state, action) => {
            state.sortBy = action.payload
        },
        setSearch: (state, action) => {
            state.searchQuery = action.payload
        },
        clearTodos: (state) => {
            state.todos = []
            state.stats = null
            state.error = null
            state.activeFilter = 'all'
            state.sortBy = 'createdAt'
            state.searchQuery = ''
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Todos
            .addCase(fetchTodos.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.loading = false
                state.todos = action.payload
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Stats
            .addCase(fetchTodoStats.pending, (state) => {
                state.statsLoading = true
            })
            .addCase(fetchTodoStats.fulfilled, (state, action) => {
                state.statsLoading = false
                state.stats = action.payload
            })
            .addCase(fetchTodoStats.rejected, (state, action) => {
                state.statsLoading = false
                state.error = action.payload
            })
            // Create Todo
            .addCase(createTodo.pending, (state) => {
                state.createLoading = true
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.createLoading = false
                state.todos.unshift(action.payload)
            })
            .addCase(createTodo.rejected, (state, action) => {
                state.createLoading = false
                state.error = action.payload
            })
            // Update Todo
            .addCase(updateTodo.fulfilled, (state, action) => {
                const index = state.todos.findIndex(t => t._id === action.payload._id)
                if (index !== -1) {
                    state.todos[index] = action.payload
                }
            })
            // Delete Todo
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter(t => t._id !== action.payload)
            })
            // Toggle Complete
            .addCase(toggleComplete.fulfilled, (state, action) => {
                const index = state.todos.findIndex(t => t._id === action.payload._id)
                if (index !== -1) {
                    state.todos[index] = action.payload
                }
            })
            // Toggle Important
            .addCase(toggleImportant.fulfilled, (state, action) => {
                const index = state.todos.findIndex(t => t._id === action.payload._id)
                if (index !== -1) {
                    state.todos[index] = action.payload
                }
            })
            // Toggle Subtask
            .addCase(toggleSubtask.fulfilled, (state, action) => {
                const index = state.todos.findIndex(t => t._id === action.payload._id)
                if (index !== -1) {
                    state.todos[index] = action.payload
                }
            })
    }
})

export const { setFilter, setSort, setSearch, clearTodos, clearError } = todoSlice.actions
export default todoSlice.reducer
