import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { holidayAPI } from '../api/holiday.api'

// ──────────────────────────────────────────────
// Holiday Slice
// ──────────────────────────────────────────────

export const fetchHolidays = createAsyncThunk(
    'holidays/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await holidayAPI.getHolidays()
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch holidays'
            )
        }
    }
)

export const addHolidayThunk = createAsyncThunk(
    'holidays/add',
    async ({ date, reason }, { rejectWithValue }) => {
        try {
            const response = await holidayAPI.addHoliday(date, reason)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add holiday'
            )
        }
    }
)

export const removeHolidayThunk = createAsyncThunk(
    'holidays/remove',
    async (date, { rejectWithValue }) => {
        try {
            await holidayAPI.removeHoliday(date)
            return date
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to remove holiday'
            )
        }
    }
)

const holidaySlice = createSlice({
    name: 'holidays',
    initialState: {
        holidays: [],
        loading: false,
        error: null
    },
    reducers: {
        clearHolidays: (state) => {
            state.holidays = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHolidays.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchHolidays.fulfilled, (state, action) => {
                state.loading = false
                state.holidays = action.payload
            })
            .addCase(fetchHolidays.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addHolidayThunk.fulfilled, (state, action) => {
                state.holidays.push(action.payload)
            })
            .addCase(removeHolidayThunk.fulfilled, (state, action) => {
                state.holidays = state.holidays.filter(
                    h => h.date.split('T')[0] !== action.payload
                )
            })
    }
})

export const { clearHolidays } = holidaySlice.actions
export default holidaySlice.reducer
