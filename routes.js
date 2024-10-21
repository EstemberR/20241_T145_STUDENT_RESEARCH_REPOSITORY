const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/studentRoutes'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

//-----------------------------USERS LOGIN/LOGOUT ROUTES-------------------------------------
//User Registration
app.post('/register', (req, res) => {
});

//User Login
app.post('/login', (req, res) => {
});

//--------------------------------USER-STUDENT ROUTES----------------------------------------
app.use('/student', studentRoutes); 
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

  
//------------------------------------------------------------------------
app.listen(3000)
