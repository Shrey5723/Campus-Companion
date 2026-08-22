import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { fetchTimetable } from '../store/timetableSlice'

// ──────────────────────────────────────────────
// useTimetable Hook
// ──────────────────────────────────────────────

export function useTimetable() {
    const dispatch = useDispatch()
    const { timetable, division, subjects, loading, error } = useSelector(
        state => state.timetable
    )

    const getTimetable = useCallback(() => {
        return dispatch(fetchTimetable())
    }, [dispatch])

    return {
        timetable,
        division,
        subjects,
        loading,
        error,
        getTimetable
    }
}
