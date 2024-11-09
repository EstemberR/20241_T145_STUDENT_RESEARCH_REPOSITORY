import express from 'express';
import Instructor from '../model/Instructor.js'; 
import Admin from '../model/Admin.js'; 
import Student from '../model/Student.js'; 


import authenticateToken from '../middleware/authenticateToken.js';

const adminRoutes = express.Router();

// Route to fetch all instructors
adminRoutes.get('/accounts/instructors', authenticateToken, async (req, res) => {
  try {
    const instructors = await Instructor.find();  // Fetch all instructors from the database
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructors", error });
  }
});

// Route to fetch all students
adminRoutes.get('/accounts/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();  // Fetch all students from the database
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error });
  }
});


export default adminRoutes;
