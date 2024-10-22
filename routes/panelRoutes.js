const express = require('express')
const panelRoutes = express.Router();

  panelRoutes.get('/submissions', (req, res) =>{
    //logic to show the student research submission 
  });
  
  //view specific department
  panelRoutes.get('/:departmentId', (req, res) =>{
    //logic to show specific department
  });
  
  //View the specific student research submission
  panelRoutes.get('/submissions/:researchId', (req, res) => {
    //logic for viewing the specific student research
  });
  
  //view the approved student research
  panelRoutes.get('/submissions/:researchId/approved', (req, res) => {
    //logic for viewing the approved research 
  });
  
  //Reject research submission
  panelRoutes.put('/submissions/:researchId/reject', (req, res) => {
    //logic to reject student submission
  });
  
  //Provide feedback information
  panelRoutes.post('/submissions/:researchId/feedback', (req, res) => {
    //provide feedback on the research submission
  });
  
  //View feedback information
  panelRoutes.get('/submissions/:researchId/feedback', (req, res) => {
    //Logic to view the all the feedbacks for a research submission
  });
  
  //-----PROFILE-----
  //view the user's profile information
  panelRoutes.get('/profile', (req, res) => {
  });
  
  //edit the user's profile information
  panelRoutes.put('/profile', (req, res) => {
  });
  
  //add or change the user's profile picture
  panelRoutes.put('/profile/picture', (req, res) => {
  });
  
  module.exports = panelRoutes;