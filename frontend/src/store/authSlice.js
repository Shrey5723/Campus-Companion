import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../api/auth.api'
import { studentAPI } from '../api/student.api'

// ──────────────────────────────────────────────
// Auth Slice
// Manages: user data, authentication state, loading, errors
// ──────────────────────────────────────────────

// Async Thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(email, password)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            )
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/register',
    async (studentData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(studentData)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Registration failed'
            )
        }
    }
)

export const updateProfileThunk = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await studentAPI.updateProfile(profileData)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update profile'
            )
        }
    }
)

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('cc_user')) || null,
        isAuthenticated: !!localStorage.getItem('cc_user'),
        loading: false,
        error: null
    },
    reducers: {
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
            localStorage.removeItem('cc_user')
        },
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = true
            localStorage.setItem('cc_user', JSON.stringify(action.payload))
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
                localStorage.setItem('cc_user', JSON.stringify(action.payload))
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
                localStorage.setItem('cc_user', JSON.stringify(action.payload))
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update Profile
            .addCase(updateProfileThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                localStorage.setItem('cc_user', JSON.stringify(action.payload))
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
