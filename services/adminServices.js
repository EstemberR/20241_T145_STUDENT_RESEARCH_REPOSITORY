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
    // Function to fetch all approved repository research papers
    function getAllUserAccounts() {
        const data = readData();
        return data.userAccounts;
    }

    // Function to archive a specific user account
function archiveUserAccount(userId) {
    const data = readData();
    const user = data.userAccounts.find(account => account.userId === userId);

    if (!user) {
        throw new Error("User not found.");
    }

    if (user.isArchived) {
        throw new Error("User is already archived.");
    }

    user.isArchived = true; // Mark user as archived
    writeData(data);
    return `User ${userId} archived successfully.`;
}

// Function to restore a specific archived user account
function restoreUserAccount(userId) {
    const data = readData();
    const user = data.userAccounts.find(account => account.userId === userId);

    if (!user) {
        throw new Error("User not found.");
    }

    if (!user.isArchived) {
        throw new Error("User is not archived.");
    }

    user.isArchived = false; // Restore user account
    writeData(data);
    return `User ${userId} restored successfully.`;
}

//function for getting the user activity
function getUserActivityLogs() {
    const data = readData();
    const userAccounts = data.userAccounts;

    const studentsCount = userAccounts.filter(user => user.role === 'student').length;
    const instructorsCount = userAccounts.filter(user => user.role === 'instructor').length;
    const panelsCount = userAccounts.filter(user => user.role === 'panel').length;
    const advisersCount = userAccounts.filter(user => user.role === 'adviser').length;
    const archivedCount = userAccounts.filter(user => user.isArchived === true).length;
    const unarchivedCount = userAccounts.filter(user => user.isArchived === false).length;

    const activityData = {
        studentsCount,
        instructorsCount,
        panelsCount,
        advisersCount,
        archivedCount,
        unarchivedCount
    };

    return activityData;
}

//function for report generation
function getReports(year) {
    const data = readData();
    const repositoryResearches = data.repositoryResearches;

    // Filter researches based on the specified year
    const publishedResearches = repositoryResearches.filter(research => {
        const publishedYear = new Date(research.date_published).getFullYear(); 
        return publishedYear === parseInt(year);
    });

    return {
        year: year,
        count: publishedResearches.length
    };
}

// Function to fetch all approved repository research papers
function getAllRepositoryResearches() {
    const data = readData();
    return data.repositoryResearches;
}

// Function to delete an existing research entry
function deleteResearch(researchID) {
    const data = readData();
    let students = data.repositoryResearches; 
    const initialLength = students.length;

    // Filter out the research
    students = students.filter(research => research.researchID !== researchID);

    if (students.length < initialLength) {
        data.repositoryResearches = students; 
        writeData(data); // Write back the entire data object
        return { message: "Research deleted successfully!" };
    } else {
        throw new Error("Research not found");
    }
}

// Function to fetch all student research papers
function getAllStudentResearches() {
    const data = readData();
    const submittedResearches = data.studentResearches.filter(research => research.status === 'submitted');
    
    return submittedResearches;
}

//approve research submission
function approveResearchSubmission(researchID) {
    const data = readData(); // Read existing data
    const index = data.studentResearches.findIndex(research => research.researchID === researchID); 

    if (index !== -1) {
        if (data.studentResearches[index].status === 'approved') {
            const approvedResearch = {
                ...data.studentResearches[index],
                status: 'posted', 
            };

            data.repositoryResearches.push(approvedResearch); 
            data.studentResearches.splice(index, 1); 

            writeData(data); 
            return { message: "Research submission posted and transferred to repository successfully!" };
        } else {
            throw new Error("Research submission cannot be posted because it is not in 'submitted' status."); 
        }
    } else {
        throw new Error("Research submission not found."); 
    }
}

//reject research submission
function rejectResearchSubmission(researchID) {
    const data = readData(); // Read existing data
    const index = data.studentResearches.findIndex(research => research.researchID === researchID); 

    if (index !== -1) {
        if (data.studentResearches[index].status === 'approved') {
            data.studentResearches[index].status = 'not posted';
            writeData(data); 
            return { message: "Research submission not posted!" }; 
        } else {
            throw new Error("Research submission cannot be rejected because it is not in 'submitted' status."); 
        }
    } else {
        throw new Error("Research submission not found."); 
    }
}

// Function to get all role requests
function getAllRoleRequests() {
    const data = readData();
    return data.roleRequests; // Return all role requests
}

// Function to accept a role request
function acceptRoleRequest(requestId) {
    const data = readData();
    const roleRequests = data.roleRequests;

    const requestIndex = roleRequests.findIndex(r => r.requestId === parseInt(requestId) && r.status === 'pending');

    if (requestIndex === -1) {
        return null; // Return null if the request is not found or already processed
    }

    // Update the status to 'accepted'
    roleRequests[requestIndex].status = 'accepted';

    // Save the updated data
    writeData(data);

    return roleRequests[requestIndex]; // Return the updated request
}

// Function to reject a role request
function rejectRoleRequest(requestId) {
    const data = readData();
    const roleRequests = data.roleRequests;

    const requestIndex = roleRequests.findIndex(r => r.requestId === parseInt(requestId) && r.status === 'pending');

    if (requestIndex === -1) {
        return null; 
    }

    roleRequests[requestIndex].status = 'rejected';

    writeData(data);

    return roleRequests[requestIndex]; // Return the updated request
}

 module.exports = { 
    readData, 
    writeData, 
    getAllUserAccounts,
    archiveUserAccount,
    restoreUserAccount,
    getUserActivityLogs,
    getReports,
    getAllRepositoryResearches,
    deleteResearch,
    getAllStudentResearches,
    approveResearchSubmission,
    rejectResearchSubmission,
    getAllRoleRequests,
    rejectRoleRequest,
    acceptRoleRequest
};