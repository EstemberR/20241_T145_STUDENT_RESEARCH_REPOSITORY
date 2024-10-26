const express = require('express')
const panelRoutes = express.Router();
const panelServices = require("../services/panelServices")

    //show the student research submission 
  panelRoutes.get('/submissions', (req, res) =>{
    try {
      const submissions = panelServices.getAllSubmissions();
      res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  //view specific department
  panelRoutes.get('/submissions/:departmentId', (req, res) =>{
      const { departmentId } = req.params;
      try {
          const department = panelServices.getDepartment(departmentId);
          res.status(200).json(department);
      } catch (error) {
          res.status(404).json({ error: error.message });
      }
  });
  
  //View the specific student research submission
  panelRoutes.get('/submissions/:researchId', (req, res) => {
    const { researchId } = req.params;
    try {asdas
        const research = panelServices.getResearchById(researchId);
        res.status(200).json(research);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //view the approved student research
  panelRoutes.get('/submissions/approved', (req, res) => {
    const { researchId } = req.params;
    try {
        const approvedResearch = panelServices.getApprovedResearch(researchId);
        res.status(200).json(approvedResearch);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //Reject research submission
  panelRoutes.put('/submissions/:researchId/reject', (req, res) => {
    const { researchId } = req.params;
    try {
        const result = panelServices.rejectResearch(researchId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //Provide feedback information
  panelRoutes.post('/submissions/:researchId/:feedback', (req, res) => {
    const { researchId } = req.params;
    const { feedback } = req.body;
    try {
        const result = panelServices.addFeedback(researchId, feedback);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  //View feedback information
  panelRoutes.get('/submissions/:researchId/:feedback', (req, res) => {
    const { researchId } = req.params;
    try {
        const feedbacks = panelServices.getFeedback(researchId);
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //-----PROFILE-----
  //view the user's profile information
  panelRoutes.get('/profile', (req, res) => {
    const userId = req.user.id; // Assuming you have user authentication
    try {
        const userProfile = panelServices.getUserProfile(userId);
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //add or change the user's profile picture
  panelRoutes.put('/profile/picture', (req, res) => {
    const userId = req.user.id;
    const { pictureUrl } = req.body;
    try {
        const result = panelServices.updateProfilePicture(userId, pictureUrl);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  module.exports = panelRoutes;