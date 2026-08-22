import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { calculateBunksThunk } from '../store/attendanceSlice'

// ──────────────────────────────────────────────
// useBunkCalculator Hook
// ──────────────────────────────────────────────

export function useBunkCalculator() {
    const dispatch = useDispatch()
    const { bunkData, bunkLoading } = useSelector(state => state.attendance)

    const calculate = useCallback((percentage) => {
        return dispatch(calculateBunksThunk(percentage))
    }, [dispatch])

    return {
        bunkData,
        loading: bunkLoading,
        calculate
    }
}
