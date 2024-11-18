// adminRoutes.js
import express from 'express';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import authenticateToken from '../middleware/authenticateToken.js';
import AdviserRequest from '../model/AdviserRequest.js';
import Research from '../model/Research.js';

const adminRoutes = express.Router();

adminRoutes.get('/accounts/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

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

adminRoutes.get('/accounts/instructors', authenticateToken, async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Error fetching instructors' });
  }
});

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

adminRoutes.get('/adviser-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await AdviserRequest.find()
      .sort({ createdAt: -1 });
    
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

adminRoutes.put('/adviser-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const request = await AdviserRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (status === 'approved') {
      // Find the instructor first
      const instructor = await Instructor.findById(request.instructor);
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }

      // Update instructor role - Fix for role update
      if (typeof instructor.role === 'string') {
        // If role is a string, convert to array
        instructor.role = ['instructor', 'adviser'];
      } else if (Array.isArray(instructor.role)) {
        // If role is already an array, add 'adviser' if not present
        if (!instructor.role.includes('adviser')) {
          instructor.role.push('adviser');
        }
      }

      // Save instructor with new role
      await instructor.save();
      console.log('Updated instructor roles:', instructor.role); // Debug log

      // Update research with the new adviser
      const research = await Research.findByIdAndUpdate(
        request.research,
        { adviser: request.instructor },
        { new: true }
      );

      if (!research) {
        return res.status(404).json({ message: 'Research not found' });
      }

      // Reject other pending requests for this research
      await AdviserRequest.updateMany(
        { 
          research: request.research, 
          _id: { $ne: id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    // Update the request status
    request.status = status;
    await request.save();

    // Send success response with updated data
    res.status(200).json({ 
      message: `Request ${status} successfully`,
      request: await AdviserRequest.findById(id).populate('instructor')
    });

  } catch (error) {
    console.error('Error updating adviser request:', error);
    res.status(500).json({ 
      message: 'Error updating request',
      error: error.message 
    });
  }
});

export default adminRoutes;
