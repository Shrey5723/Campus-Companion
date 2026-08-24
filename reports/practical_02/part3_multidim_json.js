/**
 * Practical 2 - Task III
 * Objective: Create and display multi-dimensional JSON Arrays, also demonstrate
 *            Accessing individual elements of the multi-dimensional JSON Arrays.
 */

console.log("===============================================================");
console.log("   PRACTICAL 2 - TASK III: MULTI-DIMENSIONAL JSON ARRAYS       ");
console.log("===============================================================\n");

// Multi-dimensional JSON Array representing Weekly Timetable per Department & Class
const collegeDepartmentTimetable = [
  // Dimension 1: Array of Departments (e.g., Index 0 = CSE, Index 1 = IT)
  {
    departmentName: "Computer Science & Engineering",
    batches: [
      // Dimension 2: Array of Batch schedules (e.g., Index 0 = Batch A, Index 1 = Batch B)
      {
        batchName: "Batch 5A",
        // Dimension 3: 2D Matrix of days (Rows) and slot subjects (Columns)
        weeklySchedule: [
          ["FSD Lab", "Operating Systems", "Break", "Computer Networks", "DSA Practice"], // Monday (Day 0)
          ["Maths-III", "FSD Lecture", "Break", "OS Lab", "Library Hour"],                // Tuesday (Day 1)
          ["CN Lab", "Cloud Computing", "Break", "Soft Skills", "Mini Project"],          // Wednesday (Day 2)
          ["Operating Systems", "FSD Lab", "Break", "AI Basics", "Sports"],               // Thursday (Day 3)
          ["Seminar", "Project Review", "Break", "Mentorship", "Coding Club"]             // Friday (Day 4)
        ]
      },
      {
        batchName: "Batch 5B",
        weeklySchedule: [
          ["Operating Systems", "FSD Lecture", "Break", "CN Lab", "Mini Project"],
          ["FSD Lab", "Maths-III", "Break", "Cloud Computing", "Sports"],
          ["Computer Networks", "AI Basics", "Break", "OS Lab", "Coding Club"],
          ["Soft Skills", "Seminar", "Break", "FSD Lab", "Mentorship"],
          ["Project Review", "Operating Systems", "Break", "DSA Practice", "Library Hour"]
        ]
      }
    ]
  },
  {
    departmentName: "Information Technology",
    batches: [
      {
        batchName: "Batch 5-IT-1",
        weeklySchedule: [
          ["Web Tech Lab", "Database Systems", "Break", "Data Science", "Python Workshop"],
          ["Cyber Security", "Web Tech", "Break", "DBMS Lab", "Self Study"],
          ["Data Science Lab", "Mobile App Dev", "Break", "Tech Seminar", "Project"],
          ["Database Systems", "Web Tech Lab", "Break", "Cloud Infra", "Open Source Lab"],
          ["Project Evaluation", "Cyber Security", "Break", "Mentoring", "Hackathon Prep"]
        ]
      }
    ]
  }
];

// Display the entire structure as JSON
console.log("1. Full Multi-Dimensional JSON Structure:\n");
console.log(JSON.stringify(collegeDepartmentTimetable, null, 2));

console.log("\n---------------------------------------------------------------");
console.log("2. Demonstrating Access to Individual Elements Across Dimensions");
console.log("---------------------------------------------------------------\n");

// Accessing Level 1: First Department Name
const dept1 = collegeDepartmentTimetable[0].departmentName;
console.log(`[Level 1] First Department: collegeDepartmentTimetable[0].departmentName -> "${dept1}"`);

// Accessing Level 2: Second Batch in CSE
const batch2 = collegeDepartmentTimetable[0].batches[1].batchName;
console.log(`[Level 2] Second Batch in CSE: collegeDepartmentTimetable[0].batches[1].batchName -> "${batch2}"`);

// Accessing Level 3: Wednesday Schedule of Batch 5A in CSE
const wednesdaySlots = collegeDepartmentTimetable[0].batches[0].weeklySchedule[2];
console.log(`[Level 3] Wednesday Slots for Batch 5A: collegeDepartmentTimetable[0].batches[0].weeklySchedule[2] ->`);
console.log("          ", JSON.stringify(wednesdaySlots));

// Accessing Level 4: Specific Slot (Thursday, Slot 2 - FSD Lab)
const specificSlot = collegeDepartmentTimetable[0].batches[0].weeklySchedule[3][1];
console.log(`\n[Level 4 - Precise Element]`);
console.log(`Target: collegeDepartmentTimetable[0].batches[0].weeklySchedule[3][1] (CSE -> Batch 5A -> Thursday (Day 3) -> Slot 2)`);
console.log(`Result: "${specificSlot}"`);

// Accessing IT Department's Friday 5th Slot (Hackathon Prep)
const itHackathonSlot = collegeDepartmentTimetable[1].batches[0].weeklySchedule[4][4];
console.log(`Target: collegeDepartmentTimetable[1].batches[0].weeklySchedule[4][4] (IT -> Batch 5-IT-1 -> Friday (Day 4) -> Slot 5)`);
console.log(`Result: "${itHackathonSlot}"`);

console.log("\n===============================================================");
