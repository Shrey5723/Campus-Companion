# PRACTICAL REPORT 04
**Subject:** Full Stack Development (FSD) — Semester 5  
**Topic:** HTML5 Geolocation, Local Storage & Drag and Drop APIs  
**Status:** Completed & Verified (Extracted directly from Campus Companion Project)  
**PDF Document:** [Practical_04_Report.pdf](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/Practical_04_Report.pdf)

---

## 🎯 Practical Objectives & Tasks

1. **Task I:** Implement Geolocation API to retrieve and process the user's current geographic coordinates.
2. **Task II:** Implement JavaScript to interact with the browser's `localStorage` API for persistent client-side state.
3. **Task III:** Demonstrate the HTML5 Drag and Drop API with interactive UI reordering and state persistence.

---

## 📚 Theoretical Foundation & Key Concepts

- **HTML5 Geolocation API:** The `navigator.geolocation` interface allows web applications to access the client's latitude and longitude via `getCurrentPosition()`, subject to explicit user consent.
- **Web Storage API (`localStorage`):** Synchronous key-value storage engine storing stringified data permanently on the client side per origin. Complex objects are stored using `JSON.stringify()` and retrieved with `JSON.parse()`.
- **HTML5 Drag and Drop API:** Event-driven API utilizing element attributes (`draggable="true"`) and event handlers (`dragstart`, `dragover`, `dragleave`, `drop`) combined with `dataTransfer` payload transport.

---

## 🛠️ Project Source Code & Implementation Details

### Task I: Geolocation API Implementation
- **Source Files:** [`frontend/src/pages/RegisterPage/RegisterPage.jsx`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/RegisterPage/RegisterPage.jsx) & [`frontend/src/pages/ProfilePage/ProfilePage.jsx`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/ProfilePage/ProfilePage.jsx)

```javascript
// ═══ Task I: Geolocation API Implementation (frontend/src/pages/RegisterPage/RegisterPage.jsx) ═══
const handleGetLocation = () => {
    if (!navigator.geolocation) {
        setLocalError('Geolocation is not supported by your browser');
        return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Reverse geocode coordinates to human-readable address
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.state_district || 'Campus Area';
                setFormData(prev => ({ ...prev, collegeName: `${city} Campus` }));
                setGeoLoading(false);
            } catch (err) {
                setLocalError('Failed to fetch location address');
                setGeoLoading(false);
            }
        },
        (error) => {
            setGeoLoading(false);
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    setLocalError('Location permission denied by user');
                    break;
                case error.POSITION_UNAVAILABLE:
                    setLocalError('Location information is unavailable');
                    break;
                case error.TIMEOUT:
                    setLocalError('Location request timed out');
                    break;
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
};
```

#### Registration Page Geolocation Execution Screenshot:
![Geolocation Implementation Screenshot](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_04/geolocation_register.png)

---

### Task II: JavaScript Local Storage API Interaction
- **Source Files:** [`frontend/src/store/themeSlice.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/store/themeSlice.js) & [`frontend/src/store/settingsSlice.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/store/settingsSlice.js)

```javascript
// ═══ Task II: Theme & Settings Local Storage Management (frontend/src/store/themeSlice.js) ═══
const getInitialTheme = () => {
    const stored = localStorage.getItem('cc_theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState: { mode: getInitialTheme() },
    reducers: {
        setTheme: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem('cc_theme', action.payload); // Persist theme mode
        },
        toggleTheme: (state) => {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('cc_theme', state.mode);     // Update storage key
        }
    }
});

// ═══ User Settings Persistence (frontend/src/store/settingsSlice.js) ═══
export const saveSettingsToStorage = (settings) => {
    localStorage.setItem('cc_settings', JSON.stringify(settings));
};
```

---

### Task III: HTML5 Drag and Drop API
- **Source Files:** [`frontend/src/pages/DashboardPage/DashboardPage.jsx`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/DashboardPage/DashboardPage.jsx) & [`frontend/src/components/common/Sidebar/Sidebar.jsx`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/components/common/Sidebar/Sidebar.jsx)

```javascript
// ═══ Task III: HTML5 Drag and Drop Handlers (frontend/src/pages/DashboardPage/DashboardPage.jsx) ═══
const handleDragStart = useCallback((e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
}, []);

const handleDragOver = useCallback((e, index) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
}, []);

const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    // Array splice reordering
    const updated = [...subjectList];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setSubjectList(updated);
    // Persist new layout order to LocalStorage
    localStorage.setItem('cc_subject_order', JSON.stringify(updated.map(s => s._id)));
    setDragOverIndex(null);
}, [subjectList]);
```

#### LocalStorage & Drag and Drop Demonstration Screenshot:
![LocalStorage and Drag and Drop Visuals](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_04/localstorage_dnd_visuals.png)

---

## 📝 Conclusion & Learning Outcomes
- Successfully integrated the HTML5 Geolocation API (`navigator.geolocation.getCurrentPosition`) to fetch user coordinates and auto-detect campus locations via reverse geocoding.
- Mastered client-side state persistence with `localStorage` for JWT authentication sessions, theme toggling, and user configurations.
- Implemented native HTML5 Drag and Drop API events (`draggable`, `dragstart`, `dragover`, `drop`) enabling fluid, customizable subject card and sidebar reordering.
