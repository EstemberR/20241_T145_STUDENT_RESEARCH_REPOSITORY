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

// Function to add feedback to a research submission
function addFeedbackToResearch(researchID, feedback) {
    const data = readData();
    const studentResearches = data.studentResearches;

    const researchIndex = studentResearches.findIndex(r => r.researchID === researchID && r.status === 'submitted');

    if (researchIndex === -1) {
        return null; 
    }

    const research = studentResearches[researchIndex];
    research.feedback = feedback;

    writeData(data);

    return research; // Return the updated research
}

// Function to create a role request
function createRoleRequest(userId, requestedRole) {
    const data = readData();
    const newRequest = {
        requestId: data.roleRequests.length + 1, // Simple ID generation
        userId,
        requestedRole,
        status: 'pending' // Default status for new requests
    };
    
    data.roleRequests.push(newRequest);
    writeData(data);
    return newRequest;
}



module.exports = { 
    readData,
    writeData,
    addFeedbackToResearch,
    createRoleRequest
}