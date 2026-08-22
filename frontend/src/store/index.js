import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import attendanceReducer from './attendanceSlice'
import timetableReducer from './timetableSlice'
import holidayReducer from './holidaySlice'
import themeReducer from './themeSlice'
import todoReducer from './todoSlice'
import settingsReducer from './settingsSlice'

// ──────────────────────────────────────────────
// Redux Store Configuration
// Central store combining all feature slices
// ──────────────────────────────────────────────

const store = configureStore({
    reducer: {
        auth: authReducer,
        attendance: attendanceReducer,
        timetable: timetableReducer,
        holidays: holidayReducer,
        theme: themeReducer,
        todos: todoReducer,
        settings: settingsReducer
    }
})

export default store
