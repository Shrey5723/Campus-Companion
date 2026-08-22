import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import {
    fetchSummary,
    fetchByDate,
    toggleAttendanceThunk,
    bulkMarkThunk,
    clearDateAttendance,
    fetchAdjustments,
    addAdjustmentThunk,
    removeAdjustmentThunk
} from '../store/attendanceSlice'

// ──────────────────────────────────────────────
// useAttendance Hook
// ──────────────────────────────────────────────

export function useAttendance() {
    const dispatch = useDispatch()
    const {
        summary, dateAttendance, adjustments,
        loading, dateLoading, adjustmentsLoading, error
    } = useSelector(state => state.attendance)

    const getSummary = useCallback(() => {
        return dispatch(fetchSummary())
    }, [dispatch])

    const getByDate = useCallback((date) => {
        return dispatch(fetchByDate(date))
    }, [dispatch])

    const toggle = useCallback((date, subject, type, isPresent) => {
        return dispatch(toggleAttendanceThunk({ date, subject, type, isPresent }))
    }, [dispatch])

    const bulkMark = useCallback((date, records) => {
        return dispatch(bulkMarkThunk({ date, records }))
    }, [dispatch])

    const clearDate = useCallback(() => {
        dispatch(clearDateAttendance())
    }, [dispatch])

    const getAdjustments = useCallback(() => {
        return dispatch(fetchAdjustments())
    }, [dispatch])

    const addAdjustment = useCallback((date, subject, type, adjustment, reason) => {
        return dispatch(addAdjustmentThunk({ date, subject, type, adjustment, reason }))
    }, [dispatch])

    const removeAdjustment = useCallback((date, subject, type) => {
        return dispatch(removeAdjustmentThunk({ date, subject, type }))
    }, [dispatch])

    return {
        summary,
        dateAttendance,
        adjustments,
        loading,
        dateLoading,
        adjustmentsLoading,
        error,
        getSummary,
        getByDate,
        toggle,
        bulkMark,
        clearDate,
        getAdjustments,
        addAdjustment,
        removeAdjustment
    }
}
