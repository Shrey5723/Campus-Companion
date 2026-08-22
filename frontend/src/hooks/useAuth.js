import { useDispatch, useSelector } from 'react-redux'
import { loginUser, registerUser, logout, clearError } from '../store/authSlice'
import { useCallback } from 'react'

// ──────────────────────────────────────────────
// useAuth Hook
// Wraps auth slice with convenient dispatch methods
// ──────────────────────────────────────────────

export function useAuth() {
    const dispatch = useDispatch()
    const { user, isAuthenticated, loading, error } = useSelector(state => state.auth)

    const login = useCallback((email, password) => {
        return dispatch(loginUser({ email, password }))
    }, [dispatch])

    const register = useCallback((studentData) => {
        return dispatch(registerUser(studentData))
    }, [dispatch])

    const handleLogout = useCallback(() => {
        dispatch(logout())
    }, [dispatch])

    const handleClearError = useCallback(() => {
        dispatch(clearError())
    }, [dispatch])

    return {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: handleLogout,
        clearError: handleClearError
    }
}
