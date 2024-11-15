// adminRoutes.js
import express from 'express';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import authenticateToken from '../middleware/authenticateToken.js';
import AdviserRequest from '../model/AdviserRequest.js';
import Research from '../model/Research.js';

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

// Archive student
adminRoutes.put('/accounts/students/:id/archive', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error archiving student:', error);
    res.status(500).json({ message: 'Error archiving student' });
  }
});

// Archive instructor
adminRoutes.put('/accounts/instructors/:id/archive', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error archiving instructor:', error);
    res.status(500).json({ message: 'Error archiving instructor' });
  }
});

// Restore student
adminRoutes.put('/accounts/students/:id/restore', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error restoring student:', error);
    res.status(500).json({ message: 'Error restoring student' });
  }
});

// Restore instructor
adminRoutes.put('/accounts/instructors/:id/restore', authenticateToken, async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    res.status(200).json(instructor);
  } catch (error) {
    console.error('Error restoring instructor:', error);
    res.status(500).json({ message: 'Error restoring instructor' });
  }
});

// Get all adviser requests with stats
adminRoutes.get('/adviser-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await AdviserRequest.find()
      .sort({ createdAt: -1 });
    
    // Get counts for the chart
    const totalInstructors = await Instructor.countDocuments();
    const totalAdvisers = await Instructor.countDocuments({ role: 'adviser' });
    const pendingRequests = await AdviserRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      requests,
      stats: {
        totalInstructors,
        totalAdvisers,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Error fetching adviser requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Handle adviser request (approve/reject)
adminRoutes.put('/adviser-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await AdviserRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the request status
    request.status = status;
    await request.save();

    // If approved, add adviser role to the instructor's existing roles
    if (status === 'approved') {
      const instructor = await Instructor.findById(request.instructor);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      // Check if instructor already has adviser role
      if (!instructor.role.includes('adviser')) {
        // Add 'adviser' role while keeping existing roles
        instructor.role = Array.isArray(instructor.role) 
          ? [...instructor.role, 'adviser']  // If role is already an array
          : [instructor.role, 'adviser'];    // If role is a single string
        
        await instructor.save();
      }

      // Update research with the new adviser
      await Research.findByIdAndUpdate(
        request.research,
        { adviser: request.instructor }
      );
    }

    res.status(200).json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating adviser request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

export default adminRoutes;
