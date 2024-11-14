import express from 'express';
import Instructor from '../model/Instructor.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import Research from '../model/Research.js';
import Student from '../model/Student.js';

const instructorRoutes = express.Router();

// Get profile route
instructorRoutes.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const user = await Instructor.findById(userId).select('name email role');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile route
instructorRoutes.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const { name, email, role } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required fields' });
        }

        const updatedUser = await Instructor.findByIdAndUpdate(
            userId,
            { name, email, role },
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser); 
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all submissions
instructorRoutes.get('/submissions', authenticateToken, async (req, res) => {
    try {
        // Log to see if route is being hit
        console.log('Fetching submissions...');
        
        const submissions = await Research.find()
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
            
        console.log('Found submissions:', submissions); // Log the found submissions
        if (!submissions.length) {
            console.log('No submissions found');
        }
        res.json(submissions);
    } catch (error) {
        console.error('Error in /submissions route:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});
// Update submission status
instructorRoutes.put('/submissions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const submission = await Research.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    submission.status = status;
    if (note) submission.note = note;
    await submission.save();
    res.json({ message: 'Status updated successfully', submission });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ message: 'Error updating submission status' });
  }
});

// Get all students managed by instructor
instructorRoutes.get('/students', authenticateToken, async (req, res) => {
    try {
        // Only fetch students that have a section assigned
        const students = await Student.find({ 
            archived: false,
            section: { $exists: true, $ne: '' } // Only get students with non-empty sections
        });
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new student
instructorRoutes.post('/students/add', authenticateToken, async (req, res) => {
    try {
        const { studentId, section } = req.body;
        
        // Check if student exists and doesn't already have a section
        const existingStudent = await Student.findOne({ 
            studentId,
            section: { $exists: false }  // Only allow adding students without sections
        });

        if (!existingStudent) {
            return res.status(404).json({ 
                message: 'Student ID not found or student already assigned to a section'
            });
        }

        // Update student's section
        existingStudent.section = section;
        await existingStudent.save();

        res.status(200).json(existingStudent);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete student from instructor's management
instructorRoutes.delete('/students/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Find the student and remove their section
        const student = await Student.findOne({ studentId });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove the section
        student.section = undefined;
        await student.save();

        res.status(200).json({ message: 'Student removed successfully' });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get detailed student information
instructorRoutes.get('/students/:studentId/details', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student basic info
        const student = await Student.findOne({ studentId });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // Combine all information
        const studentDetails = {
            ...student.toObject()
        };

        res.status(200).json(studentDetails);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default instructorRoutes;
