# PRACTICAL REPORT 02
**Subject:** Full Stack Development (FSD) — Semester 5  
**Topic:** JSON Data Manipulation & Node.js  
**Status:** Completed & Verified  
**PDF Document:** [Practical_02_Report.pdf](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/Practical_02_Report.pdf)

---

## 🎯 Practical Objectives & Tasks

1. **Task I:** Create a JSON object and display the same using Node.js in the terminal.
2. **Task II:** Create a Node.js script to read and display the content of an external JSON file.
3. **Task III:** Create and display multi-dimensional JSON Arrays, demonstrating access to individual elements.
4. **Task IV:** Create a web-based application example using JavaScript and JSON to manipulate JSON data (Using our **Campus Companion To-Do Management System**).

---

## 📚 Theoretical Foundation & Key Concepts

- **JSON (JavaScript Object Notation):** A lightweight, text-based, language-independent data-interchange format. It consists of key-value pairs (`{ "key": "value" }`) and ordered lists (`[ value1, value2 ]`).
- **Serialization & Deserialization:**
  - `JSON.stringify(object, replacer, space)`: Converts an in-memory JavaScript object into a JSON string formatted for transmission or storage.
  - `JSON.parse(jsonString)`: Parses a JSON string, reconstructing the corresponding JavaScript object in memory.
- **Node.js File System (`fs`):** Reading external files with `fs.promises.readFile()` facilitates non-blocking asynchronous data retrieval.
- **Multi-Dimensional Arrays:** Nested structures allowing matrix and tree-style data indexing across multiple dimensions (e.g. `arr[dept][batch][day][slot]`).

---

## 🛠️ Task Implementations & Source Code

### Task I: JSON Object Creation & Display in Terminal
- **File:** [`reports/practical_02/part1_json_terminal.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/part1_json_terminal.js)

```javascript
const studentProfile = {
  studentId: "CC-2024-501",
  name: "Shrey Mukeshbhai Patel",
  department: "Computer Science & Engineering",
  semester: 5,
  academicDetails: {
    enrolledCourses: ["Full Stack Development", "Operating Systems", "Computer Networks"],
    cgpa: 8.92,
    attendanceRate: "88.5%"
  },
  isActive: true
};

// 1. Raw JavaScript Object
console.log("Raw Object:", studentProfile);

// 2. Formatted JSON String (Serialized)
const jsonStringFormatted = JSON.stringify(studentProfile, null, 2);
console.log("Formatted JSON:\n", jsonStringFormatted);

// 3. Deserializing and Accessing Properties
const parsedObject = JSON.parse(jsonStringFormatted);
console.log(`Student Name : ${parsedObject.name}`);
console.log(`CGPA         : ${parsedObject.academicDetails.cgpa}`);
```

#### Terminal Execution Screenshot:
![Task 1 Terminal Output](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/task1_terminal_screenshot.png)

---

### Task II: Read and Display Content of External JSON File
- **Data File:** [`reports/practical_02/student_records.json`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/student_records.json)
- **Script File:** [`reports/practical_02/part2_read_json.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/part2_read_json.js)

```javascript
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'student_records.json');

async function loadExternalJSON() {
  try {
    const rawData = await fs.promises.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    console.log(`Institute : ${parsedData.institute}`);
    console.log(`Course    : ${parsedData.course}`);
    console.table(parsedData.students);

    parsedData.students.forEach((student, index) => {
      const isEligible = student.attendancePercentage >= parsedData.gradingPolicy.minAttendance;
      const statusIcon = isEligible ? "[OK] " : "[WARN]";
      console.log(`  ${statusIcon} #${index + 1} ${student.name.padEnd(16)} | Attendance: ${student.attendancePercentage}%`);
    });
  } catch (err) {
    console.error("Error reading JSON file:", err.message);
  }
}
loadExternalJSON();
```

#### Terminal Execution Screenshot:
![Task 2 Terminal Output](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/task2_terminal_screenshot.png)

---

### Task III: Multi-Dimensional JSON Arrays and Element Access
- **File:** [`reports/practical_02/part3_multidim_json.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/part3_multidim_json.js)

```javascript
const collegeDepartmentTimetable = [
  {
    departmentName: "Computer Science & Engineering",
    batches: [
      {
        batchName: "Batch 5A",
        weeklySchedule: [
          ["FSD Lab", "Operating Systems", "Break", "Computer Networks", "DSA Practice"], // Monday (Day 0)
          ["Maths-III", "FSD Lecture", "Break", "OS Lab", "Library Hour"],                // Tuesday (Day 1)
          ["CN Lab", "Cloud Computing", "Break", "Soft Skills", "Mini Project"],          // Wednesday (Day 2)
          ["Operating Systems", "FSD Lab", "Break", "AI Basics", "Sports"],               // Thursday (Day 3)
          ["Seminar", "Project Review", "Break", "Mentorship", "Coding Club"]             // Friday (Day 4)
        ]
      }
    ]
  }
];

// Level 1: First Department
console.log(collegeDepartmentTimetable[0].departmentName);

// Level 2: Batch Name
console.log(collegeDepartmentTimetable[0].batches[0].batchName);

// Level 3: Wednesday Schedule
console.log(collegeDepartmentTimetable[0].batches[0].weeklySchedule[2]);

// Level 4: Thursday Slot 2
console.log(collegeDepartmentTimetable[0].batches[0].weeklySchedule[3][1]); // "FSD Lab"
```

#### Terminal Execution Screenshot:
![Task 3 Terminal Output](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/reports/practical_02/task3_terminal_screenshot.png)

---

### Task IV: Web Application — Campus Companion To-Do Management System
- **Frontend View:** [`frontend/src/pages/TodoPage/TodoPage.jsx`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/pages/TodoPage/TodoPage.jsx)
- **Redux State Management:** [`frontend/src/store/todoSlice.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/store/todoSlice.js)
- **API Client:** [`frontend/src/api/todo.api.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/frontend/src/api/todo.api.js)
- **Backend Controller:** [`backend/src/controllers/todo.controller.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/backend/src/controllers/todo.controller.js)
- **Database Model:** [`backend/src/models/todo.model.js`](file:///Users/patelshreymukeshbhai/Desktop/College/sem5/FSD/Campus-Companion/backend/src/models/todo.model.js)

#### Implementation Details:
The existing Campus Companion project implements complete JSON array state operations:
1. **Adding Tasks (`createTodo`):** Dispatches asynchronous action sending JSON payload to backend endpoint `POST /api/todos`.
2. **Marking Tasks Completed (`toggleComplete`):** Mutates the boolean status and updates both the Redux store state and the MongoDB document via `PUT /api/todos/:id`.
3. **Removing Tasks (`deleteTodo`):** Triggers `DELETE /api/todos/:id` and filters out the corresponding item from the state array.

---

## 📝 Conclusion
- Successfully understood and implemented JSON parsing, serialization, and object creation in Node.js.
- Explored asynchronous file operations using Node's `fs` module to handle external JSON datasets.
- Mastered multi-dimensional JSON indexing across multiple hierarchical levels.
- Leveraged our full-stack **Campus Companion** To-Do application to demonstrate real-world JSON array state management across the React frontend and Express backend.
