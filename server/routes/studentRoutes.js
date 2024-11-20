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
        const user = await Student.findById(userId).select('name email role course section');

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

        const { name, email, role, course, section } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required fields' });
        }

        const updatedUser = await Student.findByIdAndUpdate(
            userId,
            { name, email, role, course, section },
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
        const mongoId = req.user.userId;
        const student = await Student.findById(mongoId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (!student.course) {
            return res.status(400).json({ message: 'Please set your course in your profile before submitting research' });
        }

        console.log('Student found:', student); // Debug log

        const newResearch = new Research({
            studentId: student.studentId, // Use the school ID (2201102944)
            mongoId: student._id,  // Store MongoDB ID as reference
            title: req.body.title,
            abstract: req.body.abstract,
            authors: req.body.authors,
            keywords: req.body.keywords,
            course: student.course, // Add course from student profile
            fileUrl: req.body.fileUrl,
            driveFileId: req.body.driveFileId,
            status: 'Pending',
            uploadDate: req.body.uploadDate || new Date()
        });

        console.log('Attempting to save research:', newResearch); // Debug log

        const savedResearch = await newResearch.save();
        console.log('Saved research:', savedResearch);
        res.status(201).json(savedResearch);
    } catch (error) {
        console.error('Error saving research:', error);
        res.status(500).json({ 
            message: 'Error saving research', 
            error: error.message 
        });
    }
});

// Get research entries route
studentRoutes.get('/research', authenticateToken, async (req, res) => {
    try {
        const mongoId = req.user.userId;
        const student = await Student.findById(mongoId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Fetching research for student:', student.studentId); // Debug log

        const research = await Research.find({ 
            studentId: student.studentId // Use school ID for querying
        }).sort({ createdAt: -1 });
        
        console.log('Found research entries:', research.length); // Debug log
        res.json(research);
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Error fetching research' });
    }
});

// Add this new route to get all research papers
studentRoutes.get('/all-research', authenticateToken, async (req, res) => {
    try {
        const research = await Research.find({ 
            status: 'Accepted' 
        })
        .populate('student', 'name')
        .sort({ uploadDate: -1 });
        
        res.json(research);
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Error fetching research' });
    }
});

// Add this route to get a single research paper
studentRoutes.get('/research/:id', authenticateToken, async (req, res) => {
    try {
        const research = await Research.findById(req.params.id)
            .populate('student', 'name');
        
        if (!research) {
            return res.status(404).json({ message: 'Research not found' });
        }
        
        res.json(research);
    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Error fetching research' });
    }
});

// Get all students for author selection
studentRoutes.get('/all-students', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find(
            { archived: false }, 
            'name studentId course' // Only send necessary fields
        ).sort({ name: 1 });
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

export default studentRoutes;
