const express = require('express')
const app = express()
app.use(express.json());

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


//view of student research submission 
app.get('/instructor/submissions', (req, res) =>{
  //logic to show the student research submission 
});

//view the specific submission
app.get('/instructor/submissions/researchId', (req, res) =>{
  //logic to show the specific student research submission 
});

//provide feedback or suggestions to the research submission
app.get('/instructor/submissions/:researchId/feedback', (req, res) => {
  //Logic to provide feedbacks for a research submission
});

//View feedback information
app.get('/instructor/submissions/:researchId/feedback', (req, res) => {
  //Logic to view the all the feedbacks for a research submission
});

//Reject research submission
app.put('/instructor/submissions/:researchId/reject', (req, res) => {
  //logic to reject student submission
});

//View approved research submission
app.get('/instructor/submissions/:researchId/approved', (req, res) => {
  //logic to view approved student submission
});

//-----PROFILE-----
//view the user's profile information
app.get('/instructor/profile', (req, res) => {
});

//edit the user's profile information
app.put('/instructor/profile', (req, res) => {
});

//add or change the user's profile picture
app.put('/instructor/profile/picture', (req, res) => {
});

//--------------------------------USER-PANELS ROUTES-------------------------------------------

//view of student research submission 
app.get('/panel/submissions', (req, res) =>{
  //logic to show the student research submission 
});

//view specific department
app.get('/panel/:departmentId', (req, res) =>{
  //logic to show specific department
});

//View the specific student research submission
app.get('/panel/submissions/:researchId', (req, res) => {
  //logic for viewing the specific student research
});

//view the approved student research
app.get('/panel/submissions/:researchId/approved', (req, res) => {
  //logic for viewing the approved research 
});

//Reject research submission
app.put('/panel/submissions/:researchId/reject', (req, res) => {
  //logic to reject student submission
});

//Provide feedback information
app.post('/panel/submissions/:researchId/feedback', (req, res) => {
  //provide feedback on the research submission
});

//View feedback information
app.get('/panel/submissions/:researchId/feedback', (req, res) => {
  //Logic to view the all the feedbacks for a research submission
});

//-----PROFILE-----
//view the user's profile information
app.get('/panel/profile', (req, res) => {
});

//edit the user's profile information
app.put('/panel/profile', (req, res) => {
});

//add or change the user's profile picture
app.put('/instructor/profile/picture', (req, res) => {
});


//--------------------------------USER-ADVISER ROUTES-------------------------------------------

//view of student research submission 
app.get('/adviser/assigned', (req, res) =>{
  //logic to show the student research submission 
});

//View the specific student research submission
app.get('/adviser/assigned/:researchId', (req, res) => {
  //logic for viewing the specific student research
});

//view the approved student research
app.get('/adviser/assigned/:researchId/approved', (req, res) => {
  //logic for viewing the approved research 
});

//Reject research submission
app.put('/adviser/assigned/:researchId/reject', (req, res) => {
  //logic to reject student submission
});

//Provide feedback information
app.post('/adviser/assigned/:researchId/feedback', (req, res) => {
  //provide feedback on the research submission
});

//View feedback information
app.get('/adviser/assigned/:researchId/feedback', (req, res) => {
  //Logic to view the all the feedbacks for a research submission
});

//-----PROFILE-----
//view the user's profile information
app.get('/adviser/profile', (req, res) => {
});

//edit the user's profile information
app.put('/adviser/profile', (req, res) => {
});

//add or change the user's profile picture
app.put('/adviser/profile/picture', (req, res) => {
});


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
app.get('/admin/accounts/:userId', (req, res) => {
});
  
//archive a specific user account
app.put('/admin/accounts/archive/:userId', (req, res) => {
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