# PRACTICAL REPORT 03
**Subject:** Full Stack Development (FSD) — Semester 5  
**Topic:** Responsive Web Design & CSS Layouts  
**Status:** Completed & Verified (Extracted directly from Campus Companion Project)  
**PDF Document:** [Practical_03_Report.pdf](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/Practical_03_Report.pdf)

---

## 🎯 Practical Objectives & Tasks

1. **Task I:** Create a responsive web page using the `viewport` meta tag in the document `<head>`.
2. **Task II:** Create a responsive web page using `width` and `max-width` properties, adapting images according to browser width.
3. **Task III:** Demonstrate responsive text sizing using the `vw` (viewport width) unit in CSS with `clamp()`.
4. **Task IV:** Demonstrate CSS media queries for creating adaptive breakpoints across device screen sizes.

---

## 📚 Theoretical Foundation & Key Concepts

- **Viewport Meta Tag:** Configures the virtual viewport dimensions on mobile browsers. `width=device-width` ensures the layout viewport matches the screen's independent pixel resolution, and `initial-scale=1.0` sets a 100% zoom level upon page load.
- **Fluid Sizing (`max-width: 100%` & `height: auto`):** Prevents images and UI cards from overflowing their parent containers on narrow screens while maintaining correct aspect ratios.
- **Fluid Typography (`vw` & `clamp()`):** Allows font sizes to scale smoothly in direct proportion to viewport width (`1vw = 1%` of viewport width) bounded by minimum and maximum thresholds.
- **Media Query Breakpoints:** Custom `@media (max-width: ...)` rules that refactor multi-column desktop grids into streamlined single-column stacked mobile layouts.

---

## 🛠️ Project Source Code & Implementation Details

### Task I: Viewport Meta Tag in Document `<head>`
- **Source File:** [`frontend/index.html`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- ═══ Task I: Viewport Meta Tag for Responsive Design ═══
         The viewport meta tag ensures the page scales correctly on all devices.
         'width=device-width' sets the viewport width to the device's screen width.
         'initial-scale=1.0' sets the initial zoom level to 100%. -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta name="description" content="Campus Companion — Smart attendance tracking for college students." />
    <title>Campus Companion — Attendance Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### Task II: Responsive Images & Containers (`width` & `max-width`)
- **Source Files:** [`frontend/src/styles/index.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/styles/index.css) & [`frontend/src/layouts/AuthLayout/AuthLayout.module.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/layouts/AuthLayout/AuthLayout.module.css)

```css
/* ═══ Task II: Responsive Images in Global CSS (frontend/src/styles/index.css) ═══ */
img {
  max-width: 100%;
  width: auto;
  height: auto;
  display: block;
}

.responsive-img {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

/* ═══ Task II: Responsive Container Card (frontend/src/layouts/AuthLayout/AuthLayout.module.css) ═══ */
.card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;  /* Bounded on large desktop, 100% width on mobile */
  margin: var(--space-4);
}
```

---

### Task III: Responsive Text Sizing using `vw` (Viewport Width) Units
- **Source Files:** [`frontend/src/styles/index.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/styles/index.css) & [`frontend/src/pages/DashboardPage/DashboardPage.module.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/DashboardPage/DashboardPage.module.css)

```css
/* ═══ Task III: Fluid Typography using clamp() and vw (frontend/src/styles/index.css) ═══ */
h1 { font-size: clamp(1.75rem, 4vw, 2.25rem); }    /* Scales fluidly from 28px to 36px */
h2 { font-size: clamp(1.375rem, 3vw, 1.875rem); }   /* Scales fluidly from 22px to 30px */
h3 { font-size: clamp(1.125rem, 2.5vw, 1.5rem); }   /* Scales fluidly from 18px to 24px */
h4 { font-size: clamp(1rem, 2vw, 1.25rem); }         /* Scales fluidly from 16px to 20px */

/* Responsive large numerical statistics (Dashboard & Cards) */
.stat-number {
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-family: var(--font-heading);
  font-weight: var(--weight-bold);
}

/* Responsive Stat Values in Dashboard (DashboardPage.module.css) */
.statValue {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: var(--weight-bold);
  line-height: 1;
}

.sectionTitle {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: var(--weight-semibold);
}
```

---

### Task IV: Media Queries for Adaptive Breakpoints
- **Source Files:** [`frontend/src/pages/DashboardPage/DashboardPage.module.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/DashboardPage/DashboardPage.module.css) & [`frontend/src/styles/index.css`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/styles/index.css)

```css
/* ═══ Task IV: Adaptive Media Query Breakpoints (DashboardPage.module.css) ═══ */

/* Tablet Breakpoint (<= 1024px): 4-column grid transitions to 2-column grid */
@media (max-width: 1024px) {
  .statsRow {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile Breakpoint (<= 640px): 2-column grid collapses to 1-column single stack */
@media (max-width: 640px) {
  .statsRow {
    grid-template-columns: 1fr;
  }
  .subjectGrid {
    grid-template-columns: 1fr;
  }
  .subjectCard {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

/* Mobile Breakpoint (<= 768px): Hide desktop sidebar and resize headings */
@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
  h1 { font-size: clamp(1.5rem, 5vw, 2rem); }
}
```

---

## 📱 Multi-Device Implementation Verification (Screenshots)

### 1. Desktop View (1280 × 800 px)
![Desktop View](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_03/desktop_1280px.png)

### 2. Tablet View (768 × 900 px)
![Tablet View](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_03/tablet_768px.png)

### 3. Mobile View (375 × 750 px)
![Mobile View](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_03/mobile_375px.png)

---

## 📝 Conclusion & Learning Outcomes
- Applied the standard HTML5 `viewport` meta tag for accurate 1:1 hardware pixel scaling across mobile devices.
- Implemented fluid images and containers using `max-width: 100%` and `height: auto` to prevent layout clipping.
- Utilized CSS `vw` units coupled with `clamp()` to achieve smooth fluid typography across all heading and statistical elements.
- Implemented multi-tiered CSS media queries establishing clean responsive breakpoints across Desktop, Tablet, and Mobile devices in our **Campus Companion** project.
