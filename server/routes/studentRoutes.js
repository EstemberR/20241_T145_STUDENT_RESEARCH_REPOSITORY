import express from 'express';
import Student from '../model/Student.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import FAQ from '../model/FAQ.js';
import Research from '../model/Research.js';
import Instructor from '../model/Instructor.js';
import Notification from '../model/Notification.js';

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

// Get all students for team member selection
studentRoutes.get('/all-students', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        
        // First, let's check how many total students we have
        const totalStudents = await Student.find({});
        console.log('Total students in database:', totalStudents.length);
        
        // Then check non-archived students
        const activeStudents = await Student.find({ archived: false });
        console.log('Active (non-archived) students:', activeStudents.length);
        
        // Finally, get all students except current user
        const students = await Student.find({
            _id: { $ne: currentUserId },
            archived: false
        })
        .select('name studentId email course section')
        .sort({ name: 1 });
        
        console.log('Students excluding current user:', students.length);
        console.log('Students data:', students);

        // Transform the data
        const transformedStudents = students.map(student => ({
            _id: student._id,
            name: student.name,
            studentId: student.studentId,
            email: student.email,
            course: student.course || 'No Course',
            section: student.section || 'No Section'
        }));
        
        res.json(transformedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Add delete research route
studentRoutes.delete('/research/:id', authenticateToken, async (req, res) => {
    try {
        const researchId = req.params.id;
        const mongoId = req.user.userId;
        
        // Verify ownership
        const research = await Research.findById(researchId);
        if (!research) {
            return res.status(404).json({ message: 'Research not found' });
        }
        
        if (research.mongoId.toString() !== mongoId) {
            return res.status(403).json({ message: 'Not authorized to delete this research' });
        }

        await Research.findByIdAndDelete(researchId);
        res.json({ message: 'Research deleted successfully' });
    } catch (error) {
        console.error('Error deleting research:', error);
        res.status(500).json({ message: 'Error deleting research' });
    }
});

// Get all instructors
studentRoutes.get('/all-instructors', authenticateToken, async (req, res) => {
    try {
        const instructors = await Instructor.find(
            { archived: false },
            'name email' // Only send necessary fields
        ).sort({ name: 1 });
        
        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

// Manage team members
studentRoutes.post('/manage-members', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { members, instructor } = req.body;

        // Find the student's research
        const research = await Research.findOne({ mongoId: studentId });
        
        if (!research) {
            return res.status(404).json({ message: 'No research found for this student' });
        }

        // Update research with team members and instructor
        research.teamMembers = members;
        research.adviser = instructor;

        await research.save();

        // Update all team members' sections
        if (members && members.length > 0) {
            await Student.updateMany(
                { _id: { $in: members } }
            );
        }

        res.status(200).json({ 
            message: 'Team members updated successfully',
            research 
        });
    } catch (error) {
        console.error('Error managing team members:', error);
        res.status(500).json({ message: 'Error updating team members' });
    }
});

// Check if student has team setup
studentRoutes.get('/check-team-setup', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        const research = await Research.findOne({ mongoId: studentId })
            .populate('teamMembers')
            .populate('adviser');

        const isSetup = research && 
                       research.teamMembers.length > 0 && 
                       research.adviser && 
                       research.section;

        res.json({ 
            isSetup,
            message: isSetup ? 'Team is set up' : 'Please set up your team first'
        });
    } catch (error) {
        console.error('Error checking team setup:', error);
        res.status(500).json({ message: 'Error checking team setup' });
    }
});

// Create team notification
studentRoutes.post('/create-team-notification', authenticateToken, async (req, res) => {
    try {
        const { instructorId, teamMembers } = req.body;
        
        // Update validation
        if (!instructorId || !teamMembers) {
            return res.status(400).json({ 
                message: 'Missing required fields: instructorId or teamMembers' 
            });
        }

        // Get the requesting student's details
        const student = await Student.findById(req.user.userId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student already has a pending request
        const existingRequest = await Notification.findOne({
            'relatedData.studentId': req.user.userId,
            type: 'TEAM_REQUEST',
            status: 'UNREAD'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'You already have a pending team request' 
            });
        }

        // Create instructor notification
        const instructorNotification = new Notification({
            recipient: instructorId,
            recipientModel: 'Instructor',
            type: 'TEAM_REQUEST',
            status: 'UNREAD',
            message: `New team formation request from ${student.name}`,
            relatedData: {
                studentId: req.user.userId,
                teamMembers: teamMembers,
                studentName: student.name
            }
        });

        // Create student notification
        const studentNotification = new Notification({
            recipient: req.user.userId,
            recipientModel: 'Student',
            type: 'TEAM_REQUEST',
            status: 'UNREAD',
            message: 'Your team formation request has been sent to the instructor for approval.',
            relatedData: {
                instructorId,
                teamMembers
            }
        });

        // Save both notifications
        await Promise.all([
            instructorNotification.save(),
            studentNotification.save()
        ]);

        console.log('Team request created:', {
            instructorNotification,
            studentNotification
        });

        res.status(201).json({ 
            message: 'Team request sent successfully',
            instructorNotification,
            studentNotification
        });

    } catch (error) {
        console.error('Error creating team notification:', error);
        res.status(500).json({ 
            message: 'Error creating team notification',
            error: error.message 
        });
    }
});

// Get notifications for student
studentRoutes.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const notifications = await Notification.find({
            recipient: userId,
            recipientModel: 'Student'
        })
        .sort({ timestamp: -1 }); // Most recent first
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark notification as read
studentRoutes.put('/notifications/:id/mark-read', authenticateToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.userId;

        console.log('Marking notification as read:', { notificationId, userId });

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: userId,
                status: 'UNREAD'  // Only update if it's currently unread
            },
            { 
                $set: { status: 'READ' } 
            },
            { 
                new: true,  // Return the updated document
                runValidators: true
            }
        );

        if (!notification) {
            return res.status(404).json({ 
                message: 'Notification not found or already read' 
            });
        }

        console.log('Notification updated:', notification);
        res.json({ 
            success: true,
            message: 'Notification marked as read',
            notification 
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            message: 'Error updating notification',
            error: error.message 
        });
    }
});

// Check team status
studentRoutes.get('/check-team-status', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        
        // Find research entry where student is either leader or member
        const research = await Research.findOne({
            $or: [
                { mongoId: studentId },
                { teamMembers: { $regex: studentId } }
            ]
        })
        .populate('adviser', 'name');

        // Check for pending requests
        const pendingRequest = await Notification.findOne({
            $or: [
                { 'relatedData.studentId': studentId },
                { 'relatedData.teamMembers': studentId }
            ],
            type: 'TEAM_REQUEST',
            status: 'UNREAD'
        });

        if (research?.adviser) {
            // Get the student's section
            const student = await Student.findById(studentId);
            
            return res.json({
                hasApprovedTeam: true,
                hasPendingRequest: false,
                teamMembers: research.teamMembers, // Already formatted strings
                instructor: research.adviser.name
            });
        } else if (pendingRequest) {
            return res.json({
                hasApprovedTeam: false,
                hasPendingRequest: true,
                message: 'You have a pending team request',
                requestDetails: {
                    timestamp: pendingRequest.timestamp
                }
            });
        } else {
            return res.json({
                hasApprovedTeam: false,
                hasPendingRequest: false
            });
        }
    } catch (error) {
        console.error('Error checking team status:', error);
        res.status(500).json({ 
            message: 'Error checking team status',
            error: error.message 
        });
    }
});

export default studentRoutes;
