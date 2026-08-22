import { createSlice } from '@reduxjs/toolkit'

// ──────────────────────────────────────────────
// Theme Slice
// Manages: 'system' | 'light' | 'dark'
// Persists preference in localStorage
// ──────────────────────────────────────────────

function getInitialTheme() {
    const stored = localStorage.getItem('cc_theme')
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored
    }
    return 'system'
}

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        mode: getInitialTheme()
    },
    reducers: {
        setTheme: (state, action) => {
            state.mode = action.payload
            localStorage.setItem('cc_theme', action.payload)
        },
        toggleTheme: (state) => {
            const order = ['light', 'dark', 'system']
            const currentIndex = order.indexOf(state.mode)
            state.mode = order[(currentIndex + 1) % order.length]
            localStorage.setItem('cc_theme', state.mode)
        }
    }
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
