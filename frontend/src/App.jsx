import { useTheme } from './hooks/useTheme'
import AppRoutes from './routes/AppRoutes'

// ──────────────────────────────────────────────
// App Component
// Root component — initializes theme + renders routes
// ──────────────────────────────────────────────

export default function App() {
    // Initialize theme (applies data-theme to document)
    useTheme()

    return <AppRoutes />
}
