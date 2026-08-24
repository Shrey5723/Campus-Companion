# PRACTICAL REPORT 05
**Subject:** Full Stack Development (FSD) — Semester 5  
**Topic:** Bootstrap 5 Online & Offline Implementation & Student Registration Form  
**Status:** Completed, Verified & Documented (Standalone in `reports/practical_05/`)  
**PDF Document:** [Practical_05_Report.pdf](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/Practical_05_Report.pdf)

---

## 🎯 Practical Objectives & Tasks

1. **Task I:** Demonstrate the implementation of Bootstrap online (using the CDN link).
2. **Task II:** Demonstrate the implementation of Bootstrap offline (using local static files).
3. **Task III:** Create a simple web page using Bootstrap 5 with HTML for student registration including page title, roll number, first name, mobile number, email ID, and address.

---

## 💡 Architecture Note
Our primary Campus Companion repository uses modular Vanilla CSS/CSS Modules for design fidelity. As per practical requirements, standalone clean Bootstrap 5 implementations were created, rendered, and verified in [`reports/practical_05/`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/) without altering the main production codebase.

---

## 📚 Theoretical Foundation & Key Concepts

- **Content Delivery Network (CDN):** Serves cached, minified CSS and JS bundles globally with subresource integrity (`integrity` attribute) and cross-origin resource sharing (`crossorigin="anonymous"`).
- **Self-Hosted Offline Architecture:** Bundles `bootstrap.min.css` and `bootstrap.bundle.min.js` directly within the project's static asset directory, enabling execution in air-gapped networks, intranets, and offline lab machines.
- **Bootstrap 5 Grid & Forms:** Utilizes a mobile-first 12-column flexbox grid system (`container`, `row`, `col-*`), standard form controls (`form-control`, `form-label`, `input-group`), and browser-native validation integration (`was-validated`).

---

## 🛠️ Code & Implementation Details

### Task I: Bootstrap 5 Online Implementation (CDN)
- **Source File:** [`reports/practical_05/task1_bootstrap_online.html`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task1_bootstrap_online.html)

```html
<!-- Bootstrap 5 CSS via jsDelivr CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
      rel="stylesheet" 
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
      crossorigin="anonymous">

<!-- Responsive Grid & Cards -->
<div class="container my-4">
  <div class="row g-4">
    <div class="col-md-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body text-center">
          <h4 class="card-title fw-bold">Zero Setup</h4>
          <p class="card-text text-muted">Instant inclusion via remote CDN links.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Bootstrap 5 JS Bundle via CDN -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
        crossorigin="anonymous"></script>
```

#### Online CDN Implementation Screenshot:
![Bootstrap 5 Online CDN](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task1_online_screenshot.png)

---

### Task II: Bootstrap 5 Offline Implementation (Local Assets)
- **Source File:** [`reports/practical_05/task2_bootstrap_offline.html`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task2_bootstrap_offline.html)
- **Asset Directory:** [`reports/practical_05/assets/`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/assets/)

```html
<!-- Offline Local Bootstrap 5 CSS -->
<link rel="stylesheet" href="./assets/css/bootstrap.min.css">

<!-- Offline Interactive Accordion -->
<div class="accordion" id="offlineAccordion">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
        1. Intranet & Air-Gapped Environments
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#offlineAccordion">
      <div class="accordion-body">
        Guarantees functionality without external network dependencies.
      </div>
    </div>
  </div>
</div>

<!-- Offline Local Bootstrap 5 JS Bundle -->
<script src="./assets/js/bootstrap.bundle.min.js"></script>
```

#### Offline Implementation Screenshot:
![Bootstrap 5 Offline](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task2_offline_screenshot.png)

---

### Task III: Bootstrap 5 Student Registration Form
- **Source File:** [`reports/practical_05/task3_student_registration.html`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task3_student_registration.html)

**Form Fields Included:**
1. **Title of the Page:** "Student Registration Form"
2. **Roll Number / Enrollment No:** Text input with pattern validation
3. **First Name:** Validated name input
4. **Mobile Number:** 10-digit mobile pattern validation
5. **Email ID:** Email input type with regex validation
6. **Address:** Textarea for complete residential address

```html
<!-- Page Title & Registration Form Header -->
<div class="form-header text-center">
  <h2 class="fw-bold mb-1"><i class="bi bi-person-plus-fill me-2"></i>Student Registration Form</h2>
  <p class="mb-0 text-white-50">Academic Admission Portal</p>
</div>

<form id="studentForm" novalidate>
  <!-- Roll Number -->
  <div class="col-md-6">
    <label for="rollNumber" class="form-label">Roll Number / Enrollment No *</label>
    <input type="text" class="form-control" id="rollNumber" placeholder="e.g. 23BCE001" required>
  </div>
  <!-- First Name -->
  <div class="col-md-6">
    <label for="firstName" class="form-label">First Name *</label>
    <input type="text" class="form-control" id="firstName" placeholder="e.g. Shrey" required minlength="2">
  </div>
  <!-- Mobile Number -->
  <div class="col-md-6">
    <label for="mobileNumber" class="form-label">Mobile Number *</label>
    <input type="tel" class="form-control" id="mobileNumber" placeholder="9876543210" pattern="^[6-9][0-9]{9}$" required>
  </div>
  <!-- Email ID -->
  <div class="col-md-6">
    <label for="emailId" class="form-label">Email ID *</label>
    <input type="email" class="form-control" id="emailId" placeholder="shrey@campus.edu" required>
  </div>
  <!-- Residential Address -->
  <div class="col-12">
    <label for="address" class="form-label">Full Address *</label>
    <textarea class="form-control" id="address" rows="3" placeholder="Street, City, State..." required minlength="10"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Submit Registration</button>
</form>
```

#### Student Registration Form Screenshot:
![Student Registration Form](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_05/task3_registration_screenshot.png)

---

## ⚖️ Comparative Analysis: CDN vs Local Hosting

| Evaluation Parameter | Online Bootstrap (CDN) | Offline Bootstrap (Local Files) |
|---|---|---|
| **Setup Complexity** | Minimal (single `<link>` / `<script>`) | Requires downloading and managing CSS/JS folders |
| **Network Dependency** | Requires active internet connectivity | Works completely offline & in air-gapped intranets |
| **Caching & Latency** | Edge CDN caching across global servers | Served directly from local server origin |
| **Version Control** | Controlled by URL version tag (e.g. v5.3.3) | Locked and versioned in repository |

---

## ✅ Practical Summary & Conclusion

- **Online CDN:** Successfully demonstrated integration with responsive navbars, cards, badges, and progress bars.
- **Offline Architecture:** Verified self-hosted `bootstrap.min.css` and `bootstrap.bundle.min.js` operating without internet.
- **Student Registration Page:** Fully compliant with all required input fields, interactive validation, and responsive mobile-first styling.
