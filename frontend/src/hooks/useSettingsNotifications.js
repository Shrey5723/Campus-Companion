import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from './useAuth'
import { useAttendance } from './useAttendance'
import { useHolidays } from './useHolidays'

// ──────────────────────────────────────────────
// useSettingsNotifications
// Honors Settings toggles: daily reminder, low attendance,
// and upcoming holiday alerts via the Notifications API.
// ──────────────────────────────────────────────

const STORAGE_KEY = 'cc_settings_notif_fired'
const CHECK_INTERVAL = 60000

function getFired() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
        return {}
    }
}

function saveFired(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function notify(title, body, tag) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/favicon.ico', tag })
}

function todayISO() {
    return new Date().toISOString().split('T')[0]
}

export function useSettingsNotifications() {
    const { isAuthenticated } = useAuth()
    const settings = useSelector(state => state.settings)
    const { summary, getSummary } = useAttendance()
    const { holidays, getHolidays } = useHolidays()
    const intervalRef = useRef(null)

    useEffect(() => {
        if (!isAuthenticated) return
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
        getSummary()
        getHolidays()
    }, [isAuthenticated, getSummary, getHolidays])

    useEffect(() => {
        if (!isAuthenticated) return

        const check = () => {
            const fired = getFired()
            const today = todayISO()
            const now = new Date()
            const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

            if (settings.dailyReminder) {
                const key = `daily-${today}`
                if (hhmm >= (settings.reminderTime || '08:00') && !fired[key]) {
                    notify('Attendance Reminder', "Don't forget to mark today's attendance.", key)
                    fired[key] = true
                }
            }

            if (settings.lowAttendanceAlert && summary) {
                const target = settings.attendanceTarget || 75
                Object.keys(summary).forEach(subject => {
                    const pct = summary[subject]?.overall?.percentage || 0
                    const key = `low-${today}-${subject}`
                    if (pct < target && !fired[key]) {
                        notify(
                            'Low Attendance Alert',
                            `${subject} is at ${pct}% (target ${target}%).`,
                            key
                        )
                        fired[key] = true
                    }
                })
            }

            if (settings.holidayNotifications && holidays?.length) {
                const tomorrow = new Date(now)
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowStr = tomorrow.toISOString().split('T')[0]

                holidays.forEach(h => {
                    const hDate = h.date?.split('T')[0]
                    if (hDate !== today && hDate !== tomorrowStr) return
                    const key = `holiday-${hDate}`
                    if (!fired[key]) {
                        const when = hDate === today ? 'today' : 'tomorrow'
                        notify(
                            'Holiday Alert',
                            `${h.reason || 'A holiday'} is ${when}.`,
                            key
                        )
                        fired[key] = true
                    }
                })
            }

            saveFired(fired)
        }

        check()
        intervalRef.current = setInterval(check, CHECK_INTERVAL)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isAuthenticated, settings, summary, holidays])
}
