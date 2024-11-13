import express from 'express';
import Student from '../model/Student.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import FAQ from '../model/FAQ.js';
import Research from '../model/Research.js';

const studentRoutes = express.Router();

// Get profile route
studentRoutes.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const user = await Student.findById(userId).select('name email role course');

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
studentRoutes.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const { name, email, role, course } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required fields' });
        }

        const updatedUser = await Student.findByIdAndUpdate(
            userId,
            { name, email, role, course },
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

studentRoutes.get('/faqs', async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (err) {
        console.error('Error fetching FAQs:', err);
        res.status(500).json({ message: err.message });
    }
});

studentRoutes.post('/submit-research', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId; // Get from auth token
        const {
            title,
            abstract,
            authors,
            keywords,
            fileUrl,
            driveFileId,
            uploadDate
        } = req.body;

        const newResearch = new Research({
            studentId,
            title,
            abstract,
            authors,
            keywords,
            fileUrl,
            driveFileId,
            status: 'Pending',
            uploadDate
        });

        const savedResearch = await newResearch.save();
        console.log('Saved research:', savedResearch);

        res.status(201).json(savedResearch);
    } catch (error) {
        console.error('Error saving research:', error);
        res.status(500).json({ message: 'Error saving research', error: error.message });
    }
});

// Submit new research
studentRoutes.post('/research', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        const researchData = {
            ...req.body,
            studentId,
            status: 'Pending'
        };

        const newResearch = new Research(researchData);
        const savedResearch = await newResearch.save();
        
        res.status(201).json(savedResearch);
    } catch (error) {
        console.error('Error saving research:', error);
        res.status(500).json({ message: 'Error saving research' });
    }
});

// Get student's research entries
studentRoutes.get('/research', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        const research = await Research.find({ studentId })
            .sort({ createdAt: -1 });
        
        res.json(research);
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Error fetching research' });
    }
});

export default studentRoutes;
