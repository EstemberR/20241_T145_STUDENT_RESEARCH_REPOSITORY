const express = require('express')
const adviserRoutes = express.Router();

//view of student research submission 
adviserRoutes.get('/assigned', (req, res) =>{
    //logic to show the student research submission 
  });
  
  //View the specific student research submission
  adviserRoutes.get('/assigned/:researchId', (req, res) => {
    //logic for viewing the specific student research
  });
  
  //view the approved student research
  adviserRoutes.get('/assigned/:researchId/approved', (req, res) => {
    //logic for viewing the approved research 
  });
  
  //Reject research submission
  adviserRoutes.put('/assigned/:researchId/reject', (req, res) => {
    //logic to reject student submission
  });
  
  //Provide feedback information
  adviserRoutes.post('/assigned/:researchId/feedback', (req, res) => {
    //provide feedback on the research submission
  });
  
  //View feedback information
  adviserRoutes.get('/assigned/:researchId/feedback', (req, res) => {
    //Logic to view the all the feedbacks for a research submission
  });
  
  //-----PROFILE-----
  //view the user's profile information
  adviserRoutes.get('/profile', (req, res) => {
  });
  
  //edit the user's profile information
  adviserRoutes.put('/profile', (req, res) => {
  });
  
  //add or change the user's profile picture
  adviserRoutes.put('/profile/picture', (req, res) => {
  });
  
  module.exports = adviserRoutes;