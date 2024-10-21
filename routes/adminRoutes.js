const express = require('express')
const adminRoutes = express.Router();

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
});

//view a specific user account
adminRoutes.get('/accounts/:userId', (req, res) => {
});
  
//archive a specific user account
adminRoutes.put('/accounts/archive/:userId', (req, res) => {
});
  
//restore a specific archived user account
adminRoutes.put('/accounts/restore/:userId', (req, res) => {
});

//-----USER ACTIVITY-----
//view user activity logs
adminRoutes.get('/activity', (req, res) => {
});

//-----GENERATE REPORTS-----
//view report statistics
adminRoutes.get('/reports', (req, res) => {
});

//print reports
adminRoutes.get('/reports/print', (req, res) => {
});

//-----RESEARCH TABLE-----
//view all published research papers
adminRoutes.get('/research', (req, res) => {
});
  
//delete a specific published research paper
adminRoutes.delete('/research/:researchId', (req, res) => {
});

//view all pending research submissions
adminRoutes.get('/research/pending', (req, res) => {
});
  
//approve a specific pending research submission
adminRoutes.put('/research/approve/:submissionId', (req, res) => {
});
  
//reject a specific pending research submission
adminRoutes.put('/research/reject/:submissionId', (req, res) => {
});

//-----ROLE REQUESTS------
//View all user role requests
adminRoutes.get('/role-requests', (req, res) => {
});

//Accept a specific user role request
adminRoutes.put('/role-requests/accept/:requestId', (req, res) => {
});
  
// Reject a specific user role request
adminRoutes.put('/role-requests/reject/:requestId', (req, res) => {
});

module.exports = adminRoutes;