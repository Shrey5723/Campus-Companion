/**
 * Practical 2 - Task II
 * Objective: Create a Node.js script to read and display the content of the external JSON file.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'student_records.json');

console.log("=================================================");
console.log("   PRACTICAL 2 - TASK II: READ EXTERNAL JSON FILE ");
console.log("=================================================\n");

console.log(`Target JSON File: ${filePath}\n`);

// 1. Asynchronous Reading using fs.promises
async function loadExternalJSON() {
  try {
    console.log("1. Reading File Asynchronously via fs.promises.readFile...");
    const rawData = await fs.promises.readFile(filePath, 'utf-8');
    
    console.log("-> File content loaded successfully. Parsing JSON...");
    const parsedData = JSON.parse(rawData);

    console.log("\n2. Parsed JSON Content Summary:");
    console.log(`Institute : ${parsedData.institute}`);
    console.log(`Course    : ${parsedData.course}`);
    console.log(`Academic  : ${parsedData.academicYear}`);
    console.log(`Min Req.  : ${parsedData.gradingPolicy.minAttendance}% Attendance\n`);

    console.log("3. Formatted Table View of Student Records:");
    console.table(parsedData.students);

    console.log("\n4. Attendance Status Report:");
    parsedData.students.forEach((student, index) => {
      const isEligible = student.attendancePercentage >= parsedData.gradingPolicy.minAttendance;
      const statusIcon = isEligible ? "[OK] " : "[WARN]";
      console.log(`  ${statusIcon} #${index + 1} ${student.name.padEnd(16)} | Attendance: ${student.attendancePercentage}% | Status: ${student.status}`);
    });

  } catch (err) {
    console.error("Error reading or parsing JSON file:", err.message);
  }
}

loadExternalJSON();
