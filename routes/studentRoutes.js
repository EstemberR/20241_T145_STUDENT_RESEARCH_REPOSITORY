const express = require('express')
const studentRoutes = express.Router();
const { addResearch, editResearch, deleteResearch, toggleSubmissionStatus } = require("../services/studentServices");

//User Logout
studentRoutes.post('/logout', (req, res) => {
}); 

//-----MY_RESEARCHES-----
//submit a new research paper
studentRoutes.post('/myResearch', (req, res) => {
    try {
        const newResearch = req.body;
        const msg = addResearch(newResearch);
        res.status(201).json(msg); // Send a 201 status for successful creation
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: "An error occurred while adding research." });
    }
});

// Edit a pending research paper
studentRoutes.put('/myResearch/:researchID', (req, res) => {
  const { researchID } = req.params;
  const updatedResearch = req.body;

  // Check if researchID is being sent in the request body
  if (updatedResearch.researchID) {
      return res.status(400).json({ message: "researchID cannot be edited." });
  }

  try {
      const msg = editResearch(researchID, updatedResearch);
      res.status(200).json(msg); // Send a 200 status for successful update
  } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message }); // Handle not found error
  }
});


// Delete a pending research project or paper
studentRoutes.delete('/myResearch/:researchID', (req, res) => {
  const { researchID } = req.params;

  try {
      const msg = deleteResearch(researchID);
      res.status(200).json(msg); // Send a 200 status for successful deletion
  } catch (error) {
      console.error(error); // Log the error
      res.status(500).json({ message: "An error occurred while deleting research." });
  }
});

// Toggle submission status
studentRoutes.put('/myResearch/:researchID/toggleSubmission', (req, res) => {
  const { researchID } = req.params;
  try {
      const msg = toggleSubmissionStatus(researchID); // Call the service to toggle the status
      res.status(200).json(msg);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while toggling the submission status." });
  }
});

//-----RESEARCH_REPOSITORY-----
//view research repository
studentRoutes.get('/repository', (req, res) => {
});

//search for research papers with optional filters
studentRoutes.get('/repository/search', (req, res) => {
  const { title, author, category } = req.query;
});

//view the selected resaerch paper in the   git repository
studentRoutes.get('/repository/:researchID', (req, res) => {
});

//bookmark the selected research to add in the bookmarks section
studentRoutes.post('/repository/:researchID/bookmark', (req, res) => {
});

//-----BOOKMARKS-----
//view all bookmarked research papers
studentRoutes.get('/bookmarks', (req, res) => {
});

//view a specific bookmarked research paper
studentRoutes.get('/bookmarks/:researchID', (req, res) => {
});

//remove a bookmarked research paper
studentRoutes.delete('/bookmarks/:researchID', (req, res) => {
});

//-----PROFILE-----
//view the user's profile information
studentRoutes.get('/profile', (req, res) => {
});

//edit the user's profile information
studentRoutes.put('/profile', (req, res) => {
});

//add or change the user's profile picture
studentRoutes.put('/profile/picture', (req, res) => {
});

module.exports = studentRoutes;