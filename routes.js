const express = require('express')
const app = express()
//-----------------------------USERS LOGIN/LOGOUT ROUTES-------------------------------------
//User Registration
app.post('/register', (req, res) => {
});

//User Login
app.post('/login', (req, res) => {
});

//--------------------------------USER-STUDENT ROUTES----------------------------------------
//User Logout
app.post('/student/logout', (req, res) => {
});

//-----RESEARCH_REPOSITORY-----
//view research repository
app.get('/student/repository', (req, res) => {
});

//search for research papers with optional filters
app.get('/student/repository/search', (req, res) => {
  const { title, author, category } = req.query;
});

//view the selected resaerch paper in the   git repository
app.get('/student/repository/:researchID', (req, res) => {
});

//bookmark the selected research to add in the bookmarks section
app.post('/student/repository/:researchID/bookmark', (req, res) => {
});

//-----MY_RESEARCHES-----
//submit a new research paper
app.post('/student/myResearch', (req, res) => {
});

//edit a pending research paper
app.put('/student/myResearch/:researchID', (req, res) => {
});

//delete a pending research project or paper
app.delete('/student/myResearch/:researchID', (req, res) => {
});

//unsubmit a research paper (e.g., withdraw from review)
app.put('/student/myResearch/:researchID/unsubmit', (req, res) => {
});
  
//resubmit a research paper (e.g., after revision or withdrawal)
  app.put('/student/myResearch/:researchID/resubmit', (req, res) => {
});

//-----BOOKMARKS-----
//view all bookmarked research papers
app.get('/student/bookmarks', (req, res) => {
});

//view a specific bookmarked research paper
app.get('/student/bookmarks/:researchID', (req, res) => {
});

//remove a bookmarked research paper
app.delete('/student/bookmarks/:researchID', (req, res) => {
});

//-----PROFILE-----
//view the user's profile information
app.get('/student/profile', (req, res) => {
});

//edit the user's profile information
app.put('/student/profile', (req, res) => {
});

//add or change the user's profile picture
app.put('/student/profile/picture', (req, res) => {
});
//--------------------------------USER-INSTRUCTOR ROUTES----------------------------------------


//--------------------------------USER-ADVISER ROUTES-------------------------------------------


//--------------------------------ADMIN ROUTES--------------------------------------------------
//User Logout
app.post('/admin/logout', (req, res) => {
});

//-----DASHBOARD-----
//view Admin Dashboard
app.get('/admin/dashboard', (req, res) => {
});

//-----MANAGE ACCOUNTS-----
//view all user accounts
app.get('/admin/accounts', (req, res) => {
});

//view a specific user account
app.put('/admin/accounts/:userId', (req, res) => {
});
  
//archive a specific user account
app.get('/admin/accounts/archive/:userId', (req, res) => {
});
  
//restore a specific archived user account
app.put('/admin/accounts/restore/:userId', (req, res) => {
});

//-----USER ACTIVITY-----
//view user activity logs
app.get('/admin/activity', (req, res) => {
});

//-----GENERATE REPORTS-----
//view report statistics
app.get('/admin/reports', (req, res) => {
});

//print reports
app.get('/admin/reports/print', (req, res) => {
});

//-----RESEARCH TABLE-----
//view all published research papers
app.get('/admin/research', (req, res) => {
});
  
//delete a specific published research paper
app.delete('/admin/research/:researchId', (req, res) => {
});

//view all pending research submissions
app.get('/admin/research/pending', (req, res) => {
});
  
//approve a specific pending research submission
app.put('/admin/research/approve/:submissionId', (req, res) => {
});
  
//reject a specific pending research submission
app.put('/admin/research/reject/:submissionId', (req, res) => {
});

//-----ROLE REQUESTS------
//View all user role requests
app.get('/admin/role-requests', (req, res) => {
});

//Accept a specific user role request
app.put('/admin/role-requests/accept/:requestId', (req, res) => {
});
  
// Reject a specific user role request
app.put('/admin/role-requests/reject/:requestId', (req, res) => {
});
  
//------------------------------------------------------------------------
app.listen(3000)