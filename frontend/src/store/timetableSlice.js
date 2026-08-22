import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { timetableAPI } from '../api/timetable.api'

// ──────────────────────────────────────────────
// Timetable Slice
// ──────────────────────────────────────────────

export const fetchTimetable = createAsyncThunk(
    'timetable/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getTimetable()
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch timetable'
            )
        }
    }
)

const timetableSlice = createSlice({
    name: 'timetable',
    initialState: {
        timetable: null,
        division: null,
        subjects: [],
        loading: false,
        error: null
    },
    reducers: {
        clearTimetable: (state) => {
            state.timetable = null
            state.division = null
            state.subjects = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTimetable.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchTimetable.fulfilled, (state, action) => {
                state.loading = false
                state.timetable = action.payload.timetable
                state.division = action.payload.division
                state.subjects = action.payload.subjects
            })
            .addCase(fetchTimetable.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { clearTimetable } = timetableSlice.actions
export default timetableSlice.reducer
