import express from 'express';
import Instructor from '../model/Instructor.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import Research from '../model/Research.js';

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

export default instructorRoutes;
