const express = require('express');
const studentRoutes = express.Router();
const studentServices = require("../services/studentServices");

// User Logout
studentRoutes.post('/logout', (req, res) => {
}); 

//-----MY_RESEARCHES-----
// View all My Researches
studentRoutes.get('/myResearch', (req, res) => {
    const studentResearches = studentServices.getAllStudentResearches();
    res.json(studentResearches);
});

// Submit a new research paper
studentRoutes.post('/myResearch', (req, res) => {
    try {
        const newResearch = req.body;
        const msg = studentServices.addResearch(newResearch); 
        res.status(201).json(msg); // Successful creation
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: "An error occurred while adding research." });
    }
});

// View a selected research paper in My Research
studentRoutes.get('/myResearch/:researchID', (req, res) => {
    const researchID = req.params.researchID;
    const studentResearches = studentServices.getAllStudentResearches();
    const research = studentResearches.find(r => r.researchID === researchID);
    if (research) {
        res.json(research);
    } else {
        res.status(404).json({ message: "Research not found." });
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
        const msg = studentServices.editResearch(researchID, updatedResearch); 
        res.status(200).json(msg); // Successful update
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message }); // Handle not found error
    }
});

// Delete a pending research project or paper
studentRoutes.delete('/myResearch/:researchID', (req, res) => {
    const { researchID } = req.params;

    try {
        const msg = studentServices.deleteResearch(researchID); 
        res.status(200).json(msg); // Successful deletion
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: "An error occurred while deleting research." });
    }
});

// Toggle submission status
studentRoutes.put('/myResearch/:researchID/toggleSubmission', (req, res) => {
    const { researchID } = req.params;
    try {
        const msg = studentServices.toggleSubmissionStatus(researchID); 
        res.status(200).json(msg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while toggling the submission status." });
    }
});

//ADD RESEARCH TO BOOKMARKS section
studentRoutes.post('/repository/:researchID/bookmark', (req, res) => {
    const { researchID } = req.params;
    
    try {
        const msg = addBookmark(researchID);
        res.status(201).json(msg); // Send a 201 status for successful bookmark addition
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding the bookmark." });
    }
});

//-----RESEARCH_REPOSITORY----- 
// View research repository
studentRoutes.get('/repository', (req, res) => {
    const repositoryResearches = studentServices.getAllRepositoryResearches();
    res.json(repositoryResearches);
});

// Search for research papers with optional filters
studentRoutes.get('/repository/search', (req, res) => {
    const { title, author, date_published } = req.query;
    const filteredResearches = studentServices.searchResearches({ title, author, date_published });
    res.json(filteredResearches);
});

// View a selected research paper in the repository
studentRoutes.get('/repository/:researchID', (req, res) => {
    const researchID = req.params.researchID;
    const repositoryResearches = studentServices.getAllRepositoryResearches();
    const research = repositoryResearches.find(r => r.researchID === researchID);
    if (research) {
        res.json(research);
    } else {
        res.status(404).json({ message: "Research not found." });
    }
});

// Bookmark the selected research
studentRoutes.post('/repository/:researchID/bookmarks', (req, res) => {
    const researchID = req.params.researchID;
    studentServices.addBookmark(researchID);
    res.json({ message: "Research bookmarked successfully!" });
});

//-----BOOKMARKS---------------------------------------------------------------------------------------------------------------
// View all bookmarked research papers
studentRoutes.get('/bookmarks', (req, res) => {
    const bookmarks = studentServices.getAllBookmarkedResearches();
    res.json(bookmarks);
});

// View a specific bookmarked research paper
studentRoutes.get('/bookmarks/:researchID', (req, res) => {
    const researchID = req.params.researchID;
    const bookmarkedResearches = studentServices.getAllBookmarkedResearches();
    const research = bookmarkedResearches.find(r => r.researchID === researchID);
    if (research) {
        res.json(research);
    } else {
        res.status(404).json({ message: "Research not found." });
    }
});

// Remove a bookmarked research paper
studentRoutes.delete('/bookmarks/:researchID', (req, res) => {
    const { researchID } = req.params;

    try {
        const msg = studentServices.removeBookmark(researchID); 
        res.status(200).json(msg); // Successful removal
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: "An error occurred while removing bookmark" });
    }
});

//-----PROFILE------------------------------------------------------------------------------------------
// View the user's profile information
studentRoutes.get('/profile', (req, res) => {
    const userProfile = studentServices.getUserProfile(); 
    res.json(userProfile);
});

// Edit the user's profile information
studentRoutes.put('/profile/:userID', (req, res) => {
    const { userID } = req.params;
    const updatedUser = req.body;

    // Check if researchID is being sent in the request body
    if (updatedUser.userID) {
        return res.status(400).json({ message: "researchID cannot be edited." });
    }

    try {
        const msg = studentServices.editUserProfile(userID, updatedUser); 
        res.status(200).json(msg); // Successful update
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message }); // Handle not found error
    }
});

// Add or change the user's profile picture
studentRoutes.put('/profile/picture', (req, res) => {
    const { picture } = req.body; 
    try {
        const msg = studentServices.updateUserProfilePicture(picture);
        res.json(msg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the profile picture." });
    }
});

module.exports = studentRoutes;
