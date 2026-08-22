import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { attendanceAPI } from '../api/attendance.api'

// ──────────────────────────────────────────────
// Attendance Slice
// Manages: summary, date-wise records, bunk data
// ──────────────────────────────────────────────

export const fetchSummary = createAsyncThunk(
    'attendance/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getSummary()
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch summary'
            )
        }
    }
)

export const fetchByDate = createAsyncThunk(
    'attendance/fetchByDate',
    async (date, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getByDate(date)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch attendance for date'
            )
        }
    }
)

export const toggleAttendanceThunk = createAsyncThunk(
    'attendance/toggle',
    async ({ date, subject, type, isPresent }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.toggleAttendance({ date, subject, type, isPresent })
            return { date, subject, type, isPresent, data: response.data.data }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to toggle attendance'
            )
        }
    }
)

export const bulkMarkThunk = createAsyncThunk(
    'attendance/bulkMark',
    async ({ date, records }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.bulkMark({ date, records })
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to mark attendance'
            )
        }
    }
)

export const calculateBunksThunk = createAsyncThunk(
    'attendance/calculateBunks',
    async (percentage, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.calculateBunks(percentage)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to calculate bunks'
            )
        }
    }
)

export const fetchAdjustments = createAsyncThunk(
    'attendance/fetchAdjustments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getLectureAdjustments()
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch adjustments'
            )
        }
    }
)

export const addAdjustmentThunk = createAsyncThunk(
    'attendance/addAdjustment',
    async ({ date, subject, type, adjustment, reason }, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.addLectureAdjustment({ date, subject, type, adjustment, reason })
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add adjustment'
            )
        }
    }
)

export const removeAdjustmentThunk = createAsyncThunk(
    'attendance/removeAdjustment',
    async ({ date, subject, type }, { rejectWithValue }) => {
        try {
            await attendanceAPI.removeLectureAdjustment({ date, subject, type })
            return { date, subject, type }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to remove adjustment'
            )
        }
    }
)

export const fetchSubjectHistory = createAsyncThunk(
    'attendance/fetchSubjectHistory',
    async (subject, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getSubjectHistory(subject)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch subject history'
            )
        }
    }
)

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState: {
        summary: null,
        dateAttendance: null,
        bunkData: null,
        adjustments: [],
        subjectHistory: null,
        subjectHistoryLoading: false,
        loading: false,
        dateLoading: false,
        bunkLoading: false,
        adjustmentsLoading: false,
        error: null
    },
    reducers: {
        clearAttendance: (state) => {
            state.summary = null
            state.dateAttendance = null
            state.bunkData = null
            state.adjustments = []
            state.subjectHistory = null
            state.error = null
        },
        clearDateAttendance: (state) => {
            state.dateAttendance = null
        },
        clearSubjectHistory: (state) => {
            state.subjectHistory = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Summary
            .addCase(fetchSummary.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchSummary.fulfilled, (state, action) => {
                state.loading = false
                state.summary = action.payload
            })
            .addCase(fetchSummary.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch By Date
            .addCase(fetchByDate.pending, (state) => {
                state.dateLoading = true
            })
            .addCase(fetchByDate.fulfilled, (state, action) => {
                state.dateLoading = false
                state.dateAttendance = action.payload
            })
            .addCase(fetchByDate.rejected, (state, action) => {
                state.dateLoading = false
                state.error = action.payload
            })
            // Toggle
            .addCase(toggleAttendanceThunk.fulfilled, (state, action) => {
                // Update the date attendance record locally
                if (state.dateAttendance?.records) {
                    const { subject, type, isPresent } = action.payload
                    const record = state.dateAttendance.records.find(
                        r => r.subject === subject && r.type === type
                    )
                    if (record) {
                        record.isPresent = isPresent
                    }
                }
                // Invalidate summary so dashboard re-fetches
                state.summary = null
            })
            // Bulk Mark
            .addCase(bulkMarkThunk.fulfilled, (state) => {
                // Invalidate summary so dashboard re-fetches
                state.summary = null
            })
            // Bunk Calculator
            .addCase(calculateBunksThunk.pending, (state) => {
                state.bunkLoading = true
            })
            .addCase(calculateBunksThunk.fulfilled, (state, action) => {
                state.bunkLoading = false
                state.bunkData = action.payload
            })
            .addCase(calculateBunksThunk.rejected, (state, action) => {
                state.bunkLoading = false
                state.error = action.payload
            })
            // Fetch Adjustments
            .addCase(fetchAdjustments.pending, (state) => {
                state.adjustmentsLoading = true
            })
            .addCase(fetchAdjustments.fulfilled, (state, action) => {
                state.adjustmentsLoading = false
                state.adjustments = action.payload
            })
            .addCase(fetchAdjustments.rejected, (state, action) => {
                state.adjustmentsLoading = false
                state.error = action.payload
            })
            // Add Adjustment
            .addCase(addAdjustmentThunk.fulfilled, (state, action) => {
                state.adjustments.unshift(action.payload)
            })
            // Remove Adjustment
            .addCase(removeAdjustmentThunk.fulfilled, (state, action) => {
                const { date, subject, type } = action.payload
                state.adjustments = state.adjustments.filter(adj => {
                    const adjDate = new Date(adj.date).toISOString().split('T')[0]
                    return !(adjDate === date && adj.subject === subject && adj.type === type)
                })
            })
            // Subject History
            .addCase(fetchSubjectHistory.pending, (state) => {
                state.subjectHistoryLoading = true
            })
            .addCase(fetchSubjectHistory.fulfilled, (state, action) => {
                state.subjectHistoryLoading = false
                state.subjectHistory = action.payload
            })
            .addCase(fetchSubjectHistory.rejected, (state, action) => {
                state.subjectHistoryLoading = false
                state.error = action.payload
            })
    }
})

export const { clearAttendance, clearDateAttendance, clearSubjectHistory } = attendanceSlice.actions
export default attendanceSlice.reducer
