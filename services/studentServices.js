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

// Function to edit an existing research entry
function editResearch(researchID, updatedResearch) {
    const students = readData(); // Read existing data
    const index = students.findIndex(research => research.researchID === researchID);

    if (index !== -1) {
        // Remove researchID from updatedResearch if it exists
        delete updatedResearch.researchID;

        // Update the research entry
        students[index] = { ...students[index], ...updatedResearch };
        writeData(students); // Write back to the file
        return { message: "Research updated successfully!" };
    } else {
        throw new Error("Research not found.");
    }
}

// Function to delete an existing research entry
function deleteResearch(researchID) {
    let students = readData(); // Read existing data
    const initialLength = students.length; // Store the initial length for comparison
    students = students.filter(research => research.researchID !== researchID); // Filter out the research

    if (students.length < initialLength) {
        writeData(students); // Write back to the file
        return { message: "Research deleted successfully!" };
    } else {
        throw new Error("Research not found");
    }
}

function toggleSubmissionStatus(researchID) {
    const students = readData(); // Read existing data
    const research = students.find(item => item.researchID === researchID);

    if (!research) {
        throw new Error('Research not found'); // Handle case when research is not found
    }

    // Toggle the submission status
    if (research.status === 'submitted') {
        research.status = 'unsent'; // Mark as unsent
    } else {
        research.status = 'submitted'; // Mark as submitted
    }

    writeData(students); // Write back to the file
    return { message: `Research successfully ${research.status === 'submitted' ? 'submitted' : 'unsent'}.` };
}

module.exports = { addResearch, editResearch, deleteResearch, toggleSubmissionStatus, readData, writeData };
