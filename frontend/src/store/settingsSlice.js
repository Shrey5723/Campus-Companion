import { createSlice } from '@reduxjs/toolkit'

// ──────────────────────────────────────────────
// Settings Slice
// Manages user preferences stored in localStorage
// ──────────────────────────────────────────────

const DEFAULT_SETTINGS = {
    attendanceTarget: 75,
    dailyReminder: true,
    lowAttendanceAlert: true,
    holidayNotifications: true,
    reminderTime: '08:00',
    subjectOrder: null,      // null = default order
    navOrder: null            // null = default sidebar order
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('cc_settings')
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
        return DEFAULT_SETTINGS
    }
}

function saveSettings(settings) {
    localStorage.setItem('cc_settings', JSON.stringify(settings))
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: loadSettings(),
    reducers: {
        updateSetting: (state, action) => {
            const { key, value } = action.payload
            state[key] = value
            saveSettings(state)
        },
        updateSettings: (state, action) => {
            Object.assign(state, action.payload)
            saveSettings(state)
        },
        resetSettings: () => {
            saveSettings(DEFAULT_SETTINGS)
            return { ...DEFAULT_SETTINGS }
        }
    }
})

export const { updateSetting, updateSettings, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
