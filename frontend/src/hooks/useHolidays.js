import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { fetchHolidays, addHolidayThunk, removeHolidayThunk } from '../store/holidaySlice'

// ──────────────────────────────────────────────
// useHolidays Hook
// ──────────────────────────────────────────────

export function useHolidays() {
    const dispatch = useDispatch()
    const { holidays, loading, error } = useSelector(state => state.holidays)

    const getHolidays = useCallback(() => {
        return dispatch(fetchHolidays())
    }, [dispatch])

    const addHoliday = useCallback((date, reason) => {
        return dispatch(addHolidayThunk({ date, reason }))
    }, [dispatch])

    const removeHoliday = useCallback((date) => {
        return dispatch(removeHolidayThunk(date))
    }, [dispatch])

    return {
        holidays,
        loading,
        error,
        getHolidays,
        addHoliday,
        removeHoliday
    }
}
