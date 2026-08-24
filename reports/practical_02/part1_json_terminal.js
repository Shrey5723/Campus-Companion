/**
 * Practical 2 - Task I
 * Objective: Create a JSON object and display the same using Node.js in the terminal.
 */

// 1. Define a JavaScript object representing student & course information
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

console.log("=================================================");
console.log("   PRACTICAL 2 - TASK I: JSON OBJECT IN NODE.JS   ");
console.log("=================================================\n");

// Display the JavaScript object
console.log("1. Raw JavaScript Object:");
console.log(studentProfile);

// Convert JavaScript object to a formatted JSON string
const jsonStringFormatted = JSON.stringify(studentProfile, null, 2);

console.log("\n2. Formatted JSON String (JSON.stringify with 2-space indentation):");
console.log(jsonStringFormatted);

// Demonstrate parsing JSON back into an Object
const parsedObject = JSON.parse(jsonStringFormatted);
console.log("\n3. Verifying Object Key Access after JSON Parsing:");
console.log(`Student Name : ${parsedObject.name}`);
console.log(`Department   : ${parsedObject.department}`);
console.log(`CGPA         : ${parsedObject.academicDetails.cgpa}`);
console.log(`Top Course   : ${parsedObject.academicDetails.enrolledCourses[0]}`);

console.log("\n=================================================");
