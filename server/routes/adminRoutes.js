// adminRoutes.js
import express from 'express';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import authenticateToken from '../middleware/authenticateToken.js';

const adminRoutes = express.Router();

// Route to get all students
adminRoutes.get('/accounts/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Route to get a specific student by ID
adminRoutes.get('/accounts/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

// Route to get all instructors
adminRoutes.get('/accounts/instructors', authenticateToken, async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Error fetching instructors' });
  }
});

// Route to get a specific instructor by ID
adminRoutes.get('/accounts/instructors/:id', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ message: 'Error fetching instructor' });
  }
});

export default adminRoutes;
