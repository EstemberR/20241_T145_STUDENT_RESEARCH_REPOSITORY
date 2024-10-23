const express = require('express')
const instructorRoutes = express.Router();
const instructorServices = require("../services/instructorServices");
const userServices = require("../services/userServices");

//view of student research submission 
instructorRoutes.get('/submissions', (req, res) =>{
  const studentResearches = userServices.getAllStudentResearches();
  res.json(studentResearches);
});
  
  //view the specific submission
  instructorRoutes.get('/submissions/:researchID', (req, res) =>{
    const researchID = req.params.researchID;

    const research = userServices.getResearchById(researchID);
    if (research) {
        res.json(research);
    } else {
        res.status(404).json({ message: "Research not found or not submitted." });
    }
   });
  
  //provide feedback or suggestions to the research submission
  instructorRoutes.put('/submissions/:researchID/feedback', (req, res) => {
    const researchID = req.params.researchID;
    const feedback = req.body.feedback; 

    if (!feedback || feedback.trim() === "") {
        return res.status(400).json({ message: "Feedback cannot be empty." });
    }

    const updatedResearch = instructorServices.addFeedbackToResearch(researchID, feedback);
    if (updatedResearch) {
        res.json({ message: "Feedback added successfully.", research: updatedResearch });
    } else {
        res.status(404).json({ message: "Research not found or not submitted." });
    }
  });
  
  //Reject research submission
  instructorRoutes.put('/submissions/reject/:researchID', (req, res) => {
    const researchID = req.params.researchID;

    // Call the service function to reject the submission
    const updatedResearch = userServices.rejectResearchByID(researchID);

    if (updatedResearch) {
        res.json({ message: "Research rejected successfully.", research: updatedResearch });
    } else {
        res.status(404).json({ message: "Research not found or not submitted." });
    }
  });
  
  //View approved research submission
  instructorRoutes.get('/submissions/approve/:researchID', (req, res) => {
    const researchID = req.params.researchID;

    // Call the service function to approve the submission
    const updatedResearch = userServices.approveResearchByID(researchID);

    if (updatedResearch) {
        res.json({ message: "Research approved successfully.", research: updatedResearch });
    } else {
        res.status(404).json({ message: "Research not found or not submitted." });
    }
  });
  
  //-----PROFILE-----
  //view the user's profile information
  instructorRoutes.get('/profile', (req, res) => {
    const userProfile = userServices.getUserProfile(); 
    res.json(userProfile);
  });
  
  //edit the user's profile information
  instructorRoutes.put('/profile/:userID', (req, res) => {
    const { userID } = req.params;
    const updatedUser = req.body;

    // Check if researchID is being sent in the request body
    if (updatedUser.userID) {
        return res.status(400).json({ message: "researchID cannot be edited." });
    }

    try {
        const msg = userServices.editUserProfile(userID, updatedUser); 
        res.status(200).json(msg); // Successful update
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message }); // Handle not found error
    }
  });

  //=========ROLE REQUEST===========
  instructorRoutes.post('/role-request', (req, res) => {
    const { userId, requestedRole } = req.body;

    // Call the service function to create a role request
    const newRequest = instructorServices.createRoleRequest(userId, requestedRole);

    if (newRequest) {
        res.status(201).json({ message: "Role request submitted successfully.", request: newRequest });
    } else {
        res.status(400).json({ message: "Failed to submit role request." });
    }
  });
  
  
  module.exports = instructorRoutes;