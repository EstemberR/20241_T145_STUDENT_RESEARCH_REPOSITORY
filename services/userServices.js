const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db.json');
function readData() {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
// Function to fetch all student research papers
function getAllStudentResearches() {
    const data = readData();
    const submittedResearches = data.studentResearches.filter(research => research.status === 'submitted');
    return submittedResearches;
}
    // Function to fetch all student research papers
    function getResearchById(researchID) {
        const data = readData();
        const studentResearches = data.studentResearches;
    
        const research = studentResearches.find(r => r.researchID === researchID && r.status === 'submitted');
    
        return research;
    }

// Function to reject a research submission
function rejectResearchByID(researchID) {
    const data = readData();
    const studentResearches = data.studentResearches;

    // Find the research with the matching researchID and 'submitted' status
    const researchIndex = studentResearches.findIndex(r => r.researchID === researchID && r.status === 'submitted');

    if (researchIndex === -1) {
        return null; // Return null if the research is not found or not submitted
    }

    // Update the status to 'rejected'
    studentResearches[researchIndex].status = 'rejected';

    // Save the updated data
    writeData(data);

    return studentResearches[researchIndex]; // Return the updated research
}

// Function to approve a research submission
function approveResearchByID(researchID) {
    const data = readData();
    const studentResearches = data.studentResearches;

    // Find the research with the matching researchID and 'submitted' status
    const researchIndex = studentResearches.findIndex(r => r.researchID === researchID && r.status === 'submitted');

    if (researchIndex === -1) {
        return null; // Return null if the research is not found or not submitted
    }

    // Update the status to 'approved'
    studentResearches[researchIndex].status = 'approved';

    // Save the updated data
    writeData(data);

    return studentResearches[researchIndex]; // Return the updated research
}

    //get user profile data
    function getUserProfile() {
        const data = readData();
        return data.userProfileData;
    }

    // Function to edit user
    function editUserProfile(userID, updatedUser) {
        const students = readData(); 
        const index = students.userProfileData.findIndex(user => user.userID === userID);

        if (index !== -1) {
            delete updatedUser.userID; 

            students.userProfileData[index] = { ...students.userProfileData[index], ...updatedUser };
            writeData(students); // Write back to the file
            return { message: "user data updated successfully!" };
        } else {
            throw new Error("user not found.");
        }
    }

module.exports = { 
    readData, 
    writeData, 
    getAllStudentResearches,
    getResearchById,
    approveResearchByID,
    rejectResearchByID,
    getUserProfile,
    editUserProfile
}