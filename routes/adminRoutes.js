const express = require('express');
const adminRoutes = express.Router();
const adminServices = require("../services/adminServices");
const userServices = require("../services/userServices");

//User Logout
adminRoutes.post('/logout', (req, res) => {
});

//-----DASHBOARD-----
//view Admin Dashboard
adminRoutes.get('/dashboard', (req, res) => {
});

//-----MANAGE ACCOUNTS-----
//view all user accounts
adminRoutes.get('/accounts', (req, res) => {
    const userAccounts = adminServices.getAllUserAccounts();
    res.json(userAccounts);
});

//view a specific user account
adminRoutes.get('/accounts/:userId', (req, res) => {
    const userId = req.params.userId;
    const userAccounts = adminServices.getAllUserAccounts();
    const accounts = userAccounts.find(r => r.userId === userId);
    if (accounts) {
        res.json(accounts);
    } else {
        res.status(404).json({ message: "Account not found." });
    }
});
  
//archive a specific user account
adminRoutes.put('/accounts/archive/:userId', (req, res) => {
    const { userId } = req.params;

    try {
        const result = adminServices.archiveUserAccount(userId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
  
//restore a specific archived user account
adminRoutes.put('/accounts/restore/:userId', (req, res) => {
    const { userId } = req.params;

    try {
        const result = adminServices.restoreUserAccount(userId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//-----USER ACTIVITY-----
//view user activity logs
adminRoutes.get('/activity', (req, res) => {
    try {
        const activityData = adminServices.getUserActivityLogs();
        res.status(200).json({ message: "User activity logs retrieved successfully", data: activityData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//-----GENERATE REPORTS-----
//view report statistics
adminRoutes.get('/reports', (req, res) => {
    const { year } = req.query; // Get the year from query parameters

    // Validate year parameter
    if (!year || isNaN(year)) {
        return res.status(400).json({ message: "Please provide a valid year." });
    }

    try {
        const reportsData = adminServices.getReports(year);
        res.status(200).json({ message: "Published research reports retrieved successfully", data: reportsData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//-----RESEARCH TABLE-----
//view all published research papers
adminRoutes.get('/research', (req, res) => {
    const repositoryResearches = adminServices.getAllRepositoryResearches();
    res.json(repositoryResearches);
});
  
//delete a specific published research paper
adminRoutes.delete('/research/:researchID', (req, res) => {
    const { researchID } = req.params;
    try {
        const msg = adminServices.deleteResearch(researchID); 
        res.status(200).json(msg); // Successful deletion
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: "An error occurred while deleting research." });
    }
});

//view all pending research submissions
adminRoutes.get('/research/pending', (req, res) => {
    const studentResearches = adminServices.getAllStudentResearches();
    res.json(studentResearches);
});

//approve a specific pending research submission
adminRoutes.put('/research/pending/approve/:submissionId', (req, res) => {
    const { submissionId } = req.params; 
    try {
        const result = adminServices.approveResearchSubmission(submissionId);
        res.status(200).json(result); // Send a success response
    } catch (error) {
        console.error(error); // Log the error
        res.status(404).json({ message: error.message });
    }
});
  
//reject a specific pending research submission
adminRoutes.put('/research/pending/reject/:submissionId', (req, res) => {
    const { submissionId } = req.params; 
    try {
        const result = adminServices.rejectResearchSubmission(submissionId);
        res.status(200).json(result); // Send a success response
    } catch (error) {
        console.error(error); // Log the error
        res.status(404).json({ message: error.message });
    }
});

//-----ROLE REQUESTS------ //PS: DIPA MASULAT SAMTANG WAPA ANG EQUIVALENT LOGIC SA INSTRUCTOR
//View all user role requests
adminRoutes.get('/role-requests', (req, res) => {
    const roleRequests = adminServices.getAllRoleRequests();
    res.json(roleRequests);
});

//Accept a specific user role request
adminRoutes.put('/role-requests/accept/:requestId', (req, res) => {
    const requestId = req.params.requestId;

    const updatedRequest = adminServices.acceptRoleRequest(requestId);

    if (updatedRequest) {
        res.json({ message: "Role request accepted successfully.", request: updatedRequest });
    } else {
        res.status(404).json({ message: "Role request not found or already processed." });
    }
});
  
// Reject a specific user role request
adminRoutes.put('/role-requests/reject/:requestId', (req, res) => {
    const requestId = req.params.requestId;

    const updatedRequest = adminServices.rejectRoleRequest(requestId);

    if (updatedRequest) {
        res.json({ message: "Role request rejected successfully.", request: updatedRequest });
    } else {
        res.status(404).json({ message: "Role request not found or already processed." });
    }
});

module.exports = adminRoutes;