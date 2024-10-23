const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../panelDb.json');

// Helper functions to read and write data
function readData() {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Function to get all student research submissions
function getAllSubmissions() {
    const data = readData();
    return data.studentResearches;
}

// Function to view a specific department
function getDepartment(departmentId) {
    const data = readData();
    const department = data.departments.find(dept => dept.departmentId === departmentId);
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
}

// Function to get a specific student research submission
function getResearchById(researchId) {
    const data = readData();
    const research = data.studentResearches.find(res => res.researchID === researchId);
    if (!research) {
        throw new Error('Research not found');
    }
    return research;
}

// Function to get an approved student research submission
function getApprovedResearch(researchId) {
    const data = readData();
    const research = data.studentResearches.find(res => res.researchID === researchId && res.status === 'approved');
    if (!research) {
        throw new Error('Approved research not found');
    }
    return research;
}

// Function to reject a student research submission
function rejectResearch(researchId) {
    const data = readData();
    const researchIndex = data.studentResearches.findIndex(res => res.researchID === researchId);

    if (researchIndex === -1) {
        throw new Error('Research not found');
    }

    data.studentResearches[researchIndex].status = 'rejected';
    writeData(data);
    return { message: "Research rejected successfully!" };
}

// Function to add feedback to a research submission
function addFeedback(researchId, feedback) {
    const data = readData();
    const research = data.studentResearches.find(res => res.researchID === researchId);

    if (!research) {
        throw new Error('Research not found');
    }

    if (!research.feedback) {
        research.feedback = [];
    }

    research.feedback.push(feedback);
    writeData(data);
    return { message: "Feedback added successfully!" };
}

// Function to view feedback of a research submission
function getFeedback(researchId) {
    const data = readData();
    const research = data.studentResearches.find(res => res.researchID === researchId);

    if (!research || !research.feedback) {
        throw new Error('No feedback found for this research');
    }

    return research.feedback;
}

// Function to get user profile
function getUserProfile() {
    const data = readData();
    return data.userProfile;
}

// Function to update user profile
function updateUserProfile(updatedProfile) {
    const data = readData();
    data.userProfile = { ...data.userProfile, ...updatedProfile };
    writeData(data);
    return { message: "Profile updated successfully!" };
}

// Function to change or add user profile picture
function updateUserProfilePicture(picturePath) {
    const data = readData();
    data.userProfile.picture = picturePath;
    writeData(data);
    return { message: "Profile picture updated successfully!" };
}

module.exports = {
    getAllSubmissions,
    getDepartment,
    getResearchById,
    getApprovedResearch,
    rejectResearch,
    addFeedback,
    getFeedback,
    getUserProfile,
    updateUserProfile,
    updateUserProfilePicture
};
