import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useCallback } from 'react'
import { setTheme, toggleTheme } from '../store/themeSlice'

// ──────────────────────────────────────────────
// useTheme Hook
// Manages theme state + applies to DOM
// Detects system preference with matchMedia
// ──────────────────────────────────────────────

export function useTheme() {
    const dispatch = useDispatch()
    const { mode } = useSelector(state => state.theme)

    // Resolve effective theme (what's actually applied)
    const getEffectiveTheme = useCallback(() => {
        if (mode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
        }
        return mode
    }, [mode])

    // Apply theme to DOM
    useEffect(() => {
        const effectiveTheme = getEffectiveTheme()

        // Add transition class briefly for smooth theme change
        document.body.classList.add('theme-transitioning')
        document.documentElement.setAttribute('data-theme', effectiveTheme)

        const timer = setTimeout(() => {
            document.body.classList.remove('theme-transitioning')
        }, 350)

        return () => clearTimeout(timer)
    }, [getEffectiveTheme])

    // Listen for system theme changes when mode is 'system'
    useEffect(() => {
        if (mode !== 'system') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            const effectiveTheme = mediaQuery.matches ? 'dark' : 'light'
            document.body.classList.add('theme-transitioning')
            document.documentElement.setAttribute('data-theme', effectiveTheme)
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning')
            }, 350)
        }

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [mode])

    const handleSetTheme = useCallback((newTheme) => {
        dispatch(setTheme(newTheme))
    }, [dispatch])

    const handleToggleTheme = useCallback(() => {
        dispatch(toggleTheme())
    }, [dispatch])

    return {
        mode,
        effectiveTheme: getEffectiveTheme(),
        setTheme: handleSetTheme,
        toggleTheme: handleToggleTheme
    }
}
