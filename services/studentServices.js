const fs = require('fs');
const path = require('path');

// Path to the JSON database file
const dbPath = path.join(__dirname, '../db.json');

// Function to read data from the JSON file
function readData() {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

// Function to write data to the JSON file
function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function addResearch(newResearch) {
    const students = readData(); // Read existing data
    students.push(newResearch); // Add the new research
    writeData(students); // Write back to the file
    return { message: "Research added successfully!" };
}

module.exports = { addResearch };
