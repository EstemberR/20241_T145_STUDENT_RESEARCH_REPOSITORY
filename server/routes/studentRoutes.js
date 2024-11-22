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
        const user = await Student.findById(userId)
            .select('name email role course section managedBy')
            .populate('managedBy', 'name');

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

        // Get team information
        const research = await Research.findOne({
            $or: [
                { mongoId: mongoId },
                { teamMembers: mongoId }
            ],
            adviser: { $exists: true }
        }).populate('adviser', 'name');

        if (!research) {
            return res.status(400).json({ message: 'You must be part of an approved team to submit research' });
        }

        // Get team members' names
        const teamLeader = await Student.findById(research.mongoId);
        const teamMembers = await Student.find({
            _id: { $in: research.teamMembers }
        });

        // Format authors list
        const authorsList = [
            teamLeader.name,
            ...teamMembers.map(member => member.name)
        ].join(', ');

        const newResearch = new Research({
            studentId: student.studentId,
            mongoId: student._id,
            title: req.body.title,
            abstract: req.body.abstract,
            authors: authorsList, // Use the automatically generated authors list
            keywords: req.body.keywords,
            course: student.course,
            fileUrl: req.body.fileUrl,
            driveFileId: req.body.driveFileId,
            status: 'Pending',
            uploadDate: req.body.uploadDate || new Date(),
            teamMembers: research.teamMembers, // Include team members
            adviser: research.adviser, // Include adviser
            submittedBy: mongoId,  // Add submitter information
        });

        const savedResearch = await newResearch.save();

        // Create notifications for team members and instructor
        const notificationPromises = [
            // Notification for submitter
            new Notification({
                recipient: mongoId,
                recipientModel: 'Student',
                type: 'RESEARCH_SUBMISSION',
                message: `You have submitted a research paper: "${req.body.title}"`,
                status: 'UNREAD',
                relatedData: {
                    researchId: savedResearch._id,
                    title: req.body.title,
                    submittedBy: student.name,
                    mongoId: student._id
                }
            }).save(),

            // Notifications for other team members
            ...research.teamMembers
                .filter(memberId => memberId.toString() !== mongoId.toString())
                .map(memberId => 
                    new Notification({
                        recipient: memberId,
                        recipientModel: 'Student',
                        type: 'RESEARCH_SUBMISSION',
                        message: `${student.name} has submitted a research paper: "${req.body.title}"`,
                        status: 'UNREAD',
                        relatedData: {
                            researchId: savedResearch._id,
                            title: req.body.title,
                            submittedBy: student.name,
                            mongoId: student._id
                        }
                    }).save()
                ),

            // Notification for instructor
            new Notification({
                recipient: research.adviser._id,
                recipientModel: 'Instructor',
                type: 'RESEARCH_SUBMISSION',
                message: `New research submission from ${student.name}: "${req.body.title}"`,
                status: 'UNREAD',
                relatedData: {
                    researchId: savedResearch._id,
                    title: req.body.title,
                    submittedBy: student.name,
                    mongoId: student._id,
                    studentNumber: student.studentId
                }
            }).save()
        ];

        await Promise.all(notificationPromises);
        
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

        // Find research where student is either submitter, leader, or team member
        const research = await Research.find({ 
            $or: [
                { mongoId: mongoId },
                { teamMembers: mongoId }
            ]
        })
        .populate('submittedBy', 'name')  // Populate submitter's name
        .populate('teamMembers', 'name')   // Populate team members' names
        .sort({ uploadDate: -1 });
        
        console.log('Found research entries:', research.length);
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

// Create team notification route
studentRoutes.post('/create-team-notification', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { instructorId, teamMembers } = req.body;

        // Get the requesting student's name
        const requestingStudent = await Student.findById(studentId);
        if (!requestingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create notification for instructor
        const instructorNotification = new Notification({
            recipient: instructorId,
            recipientModel: 'Instructor',
            message: `New team request from ${requestingStudent.name}`,
            type: 'TEAM_REQUEST',
            relatedData: {
                studentId: studentId,
                teamMembers: teamMembers,
                instructorId: instructorId,
                timestamp: new Date()
            }
        });

        // Create notifications for each team member
        const teamMemberNotifications = await Promise.all(teamMembers.map(async (memberId) => {
            return new Notification({
                recipient: memberId,
                recipientModel: 'Student',
                message: `${requestingStudent.name} has added you as a team member`,
                type: 'TEAM_REQUEST',
                relatedData: {
                    studentId: studentId,
                    teamMembers: teamMembers,
                    instructorId: instructorId,
                    timestamp: new Date()
                }
            });
        }));

        // Create notification for requesting student
        const studentNotification = new Notification({
            recipient: studentId,
            recipientModel: 'Student',
            message: 'Your team request is pending instructor approval',
            type: 'TEAM_REQUEST',
            relatedData: {
                studentId: studentId,
                teamMembers: teamMembers,
                instructorId: instructorId,
                timestamp: new Date()
            }
        });

        // Save all notifications
        await Promise.all([
            instructorNotification.save(),
            ...teamMemberNotifications.map(notification => notification.save()),
            studentNotification.save()
        ]);

        console.log('Team request created with notifications for all members');

        res.status(201).json({ 
            message: 'Team request sent successfully',
            notifications: {
                instructor: instructorNotification,
                teamMembers: teamMemberNotifications,
                requestingStudent: studentNotification
            }
        });

    } catch (error) {
        console.error('Error creating team notifications:', error);
        res.status(500).json({ 
            message: 'Error creating team notifications',
            error: error.message 
        });
    }
});

// Update the notification handler for when instructor responds
studentRoutes.put('/notifications/:id/update-team-status', authenticateToken, async (req, res) => {
    try {
        const { status, message } = req.body;
        const notificationId = req.params.id;

        const originalNotification = await Notification.findById(notificationId)
            .populate('relatedData.studentId')
            .populate('relatedData.instructorId');

        if (!originalNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Update notifications for all team members
        const teamMemberUpdates = originalNotification.relatedData.teamMembers.map(async (memberId) => {
            const statusMessage = status === 'APPROVED' 
                ? `Your team membership with ${originalNotification.relatedData.studentId.name} has been approved`
                : `Team request from ${originalNotification.relatedData.studentId.name} was rejected${message ? ': ' + message : ''}`;

            return new Notification({
                recipient: memberId,
                recipientModel: 'Student',
                message: statusMessage,
                type: 'TEAM_REQUEST_RESPONSE',
                status: 'UNREAD',
                relatedData: {
                    ...originalNotification.relatedData,
                    rejectMessage: message
                }
            }).save();
        });

        // Update notification for the requesting student
        const leaderNotification = new Notification({
            recipient: originalNotification.relatedData.studentId._id,
            recipientModel: 'Student',
            message: status === 'APPROVED' 
                ? 'Your team request has been approved'
                : `Your team request was rejected${message ? ': ' + message : ''}`,
            type: 'TEAM_REQUEST_RESPONSE',
            status: 'UNREAD',
            relatedData: {
                ...originalNotification.relatedData,
                rejectMessage: message
            }
        });

        await Promise.all([
            ...teamMemberUpdates,
            leaderNotification.save()
        ]);

        res.json({ 
            success: true,
            message: 'Team status updated and notifications sent'
        });

    } catch (error) {
        console.error('Error updating team status notifications:', error);
        res.status(500).json({ 
            message: 'Error updating team status',
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
        const student = await Student.findById(studentId).populate('managedBy');
        
        // Check for the most recent team request or response
        const latestRequest = await Notification.findOne({
            $or: [
                { 
                    recipient: studentId,
                    type: { $in: ['TEAM_REQUEST', 'TEAM_REQUEST_RESPONSE'] }
                },
                { 
                    'relatedData.teamMembers': studentId,
                    type: { $in: ['TEAM_REQUEST', 'TEAM_REQUEST_RESPONSE'] }
                }
            ]
        }).sort({ timestamp: -1 })
        .populate('relatedData.studentId')
        .populate('relatedData.teamMembers')
        .populate('relatedData.instructorId');

        if (student.managedBy) {
            // Student has an approved team
            const research = await Research.findOne({ mongoId: studentId })
                .populate('teamMembers')
                .populate('mongoId');

            let teamMembers = [student.name]; // Add the poster (current student) first
            
            // Add other team members if they exist
            if (research?.teamMembers) {
                const otherMembers = research.teamMembers
                    .filter(member => member._id.toString() !== studentId) // Exclude the poster if they're in teamMembers
                    .map(member => member.name);
                teamMembers = [...teamMembers, ...otherMembers];
            }

            return res.json({
                hasApprovedTeam: true,
                hasPendingRequest: false,
                instructor: student.managedBy.name,
                section: student.section,
                teamMembers: teamMembers
            });
        } else if (latestRequest?.type === 'TEAM_REQUEST' && latestRequest?.status === 'UNREAD') {
            return res.json({
                hasApprovedTeam: false,
                hasPendingRequest: true,
                message: 'You have a pending team request'
            });
        } else if (latestRequest?.type === 'TEAM_REQUEST_RESPONSE') {
            if (latestRequest.status === 'APPROVED' || latestRequest.message.includes('approved')) {
                return res.json({
                    hasApprovedTeam: true,
                    hasPendingRequest: false,
                    message: 'Your team has been approved'
                });
            } else {
                return res.json({
                    hasApprovedTeam: false,
                    hasPendingRequest: false,
                    wasRejected: true,
                    rejectionMessage: latestRequest.relatedData?.rejectMessage
                });
            }
        }

        // If no team status found
        return res.json({
            hasApprovedTeam: false,
            hasPendingRequest: false
        });

    } catch (error) {
        console.error('Error checking team status:', error);
        res.status(500).json({ 
            message: 'Error checking team status',
            error: error.message 
        });
    }
});

export default studentRoutes;
