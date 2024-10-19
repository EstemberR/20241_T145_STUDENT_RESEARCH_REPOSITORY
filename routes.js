const express = require('express')
const app = express()
//--------------------------------USER-STUDENT ROUTES----------------------------------------
//-----LOGIN/REGISTER-----
//User Registration
app.post('/register', (req, res) => {
});

//User Login
app.post('/login', (req, res) => {
});
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

//view the selected resaerch paper in the repository
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

//--------------------------------ADMIN ROUTES--------------------------------------------------



//------------------------------------------------------------------------
app.listen(3000)