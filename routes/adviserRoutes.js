const express = require('express')
const adviserRoutes = express.Router();
const adviserServices = require("../services/adviserServices")

//view of student research submission 
adviserRoutes.get('/submissions', (req, res) =>{
  try {
    const submissions = adviserServices.getAllSubmissions();
    res.status(200).json(submissions);
  } catch (error) {
      res.status(500).json({ error: error.message });
  } 
  });
  
  //View the specific student research submission
  adviserRoutes.get('/submissions/:researchId', (req, res) => {
    const { researchId } = req.params;
    try {
        const research = adviserServices.getResearchById(researchId);
        res.status(200).json(research);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //view the approved student research
  adviserRoutes.get('/submissions/approved', (req, res) => {
    const { researchId } = req.params;
    try {
        const approvedResearch = adviserServices.getApprovedResearch(researchId);
        res.status(200).json(approvedResearch);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //Reject research submission
  adviserRoutes.put('/submission/:researchId/reject', (req, res) => {
    const { researchId } = req.params;
    try {
        const result = adviserServices.rejectResearch(researchId);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //Provide feedback information
  adviserRoutes.post('/submissions/:researchId/:feedback', (req, res) => {
    const { researchId } = req.params;
    const { feedback } = req.body;
    try {
        const result = adviserServices.addFeedback(researchId, feedback);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  //View feedback information
  adviserRoutes.get('/submissions/:researchId/:feedback', (req, res) => {
    const { researchId } = req.params;
    try {
        const feedbacks = adviserServices.getFeedback(researchId);
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //-----PROFILE-----
  //view the user's profile information
  adviserRoutes.get('/profile', (req, res) => {
    const userId = req.user.id;
    const updatedProfile = req.body;
    try {
        const result = adviserServices.editUserProfile(userId, updatedProfile);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  //edit the user's profile information
  adviserRoutes.put('/profile/picture', (req, res) => {
    const userId = req.user.id;
    const { pictureUrl } = req.body;
    try {
        const result = adviserServices.updateProfilePicture(userId, pictureUrl);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
  });
  
  module.exports = adviserRoutes;