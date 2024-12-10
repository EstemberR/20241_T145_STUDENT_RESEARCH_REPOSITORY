import express from 'express';
import Instructor from '../model/Instructor.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import Research from '../model/Research.js';
import Student from '../model/Student.js';
import AdviserRequest from '../model/AdviserRequest.js';
import Notification from '../model/Notification.js';

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

// Get all submissions from managed students only
instructorRoutes.get('/submissions', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        
        // Find all students managed by this instructor
        const managedStudents = await Student.find({ managedBy: instructorId });
        const managedStudentIds = managedStudents.map(student => student._id);

        // Get all submissions from these students
        const allSubmissions = await Research.find({
            $or: [
                { mongoId: { $in: managedStudentIds } },
                { teamMembers: { $in: managedStudentIds } }
            ]
        })
        .populate('mongoId', 'name email studentId section')
        .populate('teamMembers', 'name email studentId')
        .select('title status uploadDate studentId mongoId teamMembers version authors abstract keywords driveFileId fileUrl parentId')
        .sort({ uploadDate: -1 });

        // Group by original research and get only the latest versions
        const latestVersions = allSubmissions.reduce((acc, submission) => {
            const groupId = submission.parentId || submission._id;
            if (!acc[groupId] || acc[groupId].version < submission.version) {
                acc[groupId] = submission;
            }
            return acc;
        }, {});

        // Transform the data to include student name and version
        const transformedSubmissions = Object.values(latestVersions).map(submission => ({
            _id: submission._id,
            title: submission.title,
            authors: submission.authors,
            abstract: submission.abstract,
            keywords: submission.keywords,
            studentId: submission.mongoId?.studentId || 'Unknown',
            studentName: submission.mongoId?.name || 'Unknown',
            studentEmail: submission.mongoId?.email || 'Unknown',
            section: submission.mongoId?.section || 'Unknown',
            status: submission.status,
            uploadDate: submission.uploadDate,
            driveFileId: submission.driveFileId,
            fileUrl: submission.fileUrl,
            version: submission.version || 1
        }));

        res.json(transformedSubmissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

// Update submission status
instructorRoutes.put('/submissions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const instructorId = req.user.userId;

    const research = await Research.findById(id)
      .populate('mongoId')
      .populate('teamMembers')
      .populate('adviser', 'name');
    
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

      // Only update the status and note fields
      await Research.findByIdAndUpdate(
        id,
        { $set: { status: status, ...(note && { note: note }) } },
        { new: true, runValidators: false }
      );

    // Create notifications based on status
    const allTeamMembers = [research.mongoId._id, ...research.teamMembers.map(member => member._id)];
    let notifications;
    
    switch(status) {
      case 'Revision':
        notifications = allTeamMembers.map(memberId => ({
          recipient: memberId,
          recipientModel: 'Student',
          type: 'RESEARCH_SUBMISSION',
          message: `Your research "${research.title}" needs revision`,
          status: 'UNREAD',
          relatedData: {
            researchId: research._id,
            title: research.title,
            revisionNote: note
          }
        }));
        break;

      case 'Accepted':
        notifications = allTeamMembers.map(memberId => ({
          recipient: memberId,
          recipientModel: 'Student',
          type: 'RESEARCH_ACCEPTED',
          message: `Congratulations! Your research "${research.title}" has been accepted by ${research.adviser.name}`,
          status: 'UNREAD',
          relatedData: {
            researchId: research._id,
            title: research.title,
            acceptedBy: research.adviser.name
          }
        }));
        break;

      case 'Rejected':
        notifications = allTeamMembers.map(memberId => ({
          recipient: memberId,
          recipientModel: 'Student',
          type: 'RESEARCH_REJECTED',
          message: `Your research "${research.title}" has been rejected`,
          status: 'UNREAD',
          relatedData: {
            researchId: research._id,
            title: research.title,
            rejectionReason: note,
            rejectedBy: research.adviser.name
          }
        }));
        break;
    }

    if (notifications) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: 'Status updated successfully', research });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ message: 'Error updating submission status' });
  }
});

// Get students managed by this instructor only
instructorRoutes.get('/students', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        
        const students = await Student.find({ 
            managedBy: instructorId,  // Only get students managed by this instructor
            archived: false
        });
        
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add student to instructor's managed list
instructorRoutes.post('/students/add', authenticateToken, async (req, res) => {
    try {
        const { studentId, section } = req.body;
        const instructorId = req.user.userId;

        // Check if student exists and isn't already managed by another instructor
        const existingStudent = await Student.findOne({ 
            studentId,
            managedBy: { $exists: false }  // Only allow adding students not managed by any instructor
        });

        if (!existingStudent) {
            return res.status(404).json({ 
                message: 'Student ID not found or student already assigned to an instructor'
            });
        }

        // Update student with section and instructor
        existingStudent.section = section;
        existingStudent.managedBy = instructorId;
        await existingStudent.save();

        res.status(200).json(existingStudent);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// When deleting a student, remove instructor management
instructorRoutes.delete('/students/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const instructorId = req.user.userId;

        // Only allow removing students managed by this instructor
        const student = await Student.findOne({
            studentId,
            managedBy: instructorId
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found or not managed by you' });
        }

        // Remove instructor management and section
        student.managedBy = undefined;
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
        const student = await Student.findById(req.params.studentId)
            .populate('managedBy', 'name');
        
        // Get student's submissions
        const submissions = await Research.find({
            $or: [
                { mongoId: req.params.studentId },
                { teamMembers: req.params.studentId }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            ...student.toObject(),
            submissions
        });
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Error fetching student details' });
    }
});

// Get available research projects (those without advisers)
instructorRoutes.get('/available-research', authenticateToken, async (req, res) => {
    try {
        const availableResearch = await Research.find({
            adviser: null  // Change this line from { $exists: false } to null
        }).select('title _id studentId');

        console.log('Available research:', availableResearch); // Add this debug log
        res.status(200).json(availableResearch);
    } catch (error) {
        console.error('Error fetching available research:', error);
        res.status(500).json({ message: 'Error fetching research projects' });
    }
});

// Submit adviser request
instructorRoutes.post('/adviser-request', authenticateToken, async (req, res) => {
    try {
        const { researchId, message } = req.body;
        const instructorId = req.user.userId;

        // Get instructor details
        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({ 
                message: 'Instructor not found' 
            });
        }

        // Check if research exists and has no adviser
        const research = await Research.findOne({
            _id: researchId,
            adviser: null  // Changed from { $exists: false } to null
        });

        console.log('Found research:', research); // Debug log

        if (!research) {
            return res.status(400).json({ 
                message: 'Research not found or already has an adviser' 
            });
        }

        // Check if instructor already has a pending request for this research
        const existingRequest = await AdviserRequest.findOne({
            research: researchId,
            instructor: instructorId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'You already have a pending request for this research' 
            });
        }

        // Create adviser request with instructor details and research title
        const adviserRequest = new AdviserRequest({
            research: researchId,
            researchTitle: research.title,
            instructor: instructorId,
            instructorName: instructor.name,
            instructorEmail: instructor.email,
            message: message,
            status: 'pending'
        });

        await adviserRequest.save();

        res.status(201).json({ 
            message: 'Adviser request submitted successfully' 
        });

    } catch (error) {
        console.error('Error submitting adviser request:', error);
        res.status(500).json({ 
            message: 'Error submitting request' 
        });
    }
});

// Update the GET route to include researchTitle
instructorRoutes.get('/adviser-requests', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        
        const requests = await AdviserRequest.find({ instructor: instructorId })
            .populate('research', 'title')
            .select('research researchTitle instructorName instructorEmail message status createdAt')
            .sort({ createdAt: -1 });
            
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching adviser requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// Get researches where the instructor is the adviser
instructorRoutes.get('/advised-researches', authenticateToken, async (req, res) => {
    try {
        const researches = await Research.find({ adviser: req.user.userId })
            .populate({
                path: 'student',
                select: 'name email studentId course section'
            })
            .populate('mongoId', 'name email studentId course section')
            .sort({ uploadDate: -1 });

        // Transform the data to ensure all fields are present
        const transformedResearches = researches.map(research => ({
            _id: research._id,
            title: research.title,
            abstract: research.abstract,
            authors: research.authors,
            keywords: research.keywords,
            status: research.status,
            uploadDate: research.uploadDate,
            driveFileId: research.driveFileId,
            fileName: research.fileName,
            comments: research.comments,
            student: {
                name: research.student?.name || research.mongoId?.name,
                email: research.student?.email || research.mongoId?.email,
                studentId: research.student?.studentId || research.mongoId?.studentId,
                course: research.student?.course || research.mongoId?.course,
                section: research.student?.section || research.mongoId?.section
            }
        }));

        res.json(transformedResearches);
    } catch (error) {
        console.error('Error fetching advised researches:', error);
        res.status(500).json({ message: 'Error fetching researches' });
    }
});

// Add feedback to research
instructorRoutes.post('/research/:id/feedback', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const instructorId = req.user.userId;

        const research = await Research.findOne({
            _id: id,
            adviser: instructorId
        });

        if (!research) {
            return res.status(404).json({ 
                message: 'Research not found or you are not the adviser' 
            });
        }

        research.comments = comments;
        await research.save();

        res.status(200).json({ 
            message: 'Feedback submitted successfully',
            research 
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

// Get team requests
instructorRoutes.get('/team-requests', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        
        // Get all requests including handled ones
        const requests = await Notification.find({
            recipient: instructorId,
            recipientModel: 'Instructor',
            type: 'TEAM_REQUEST'
        }).sort({ timestamp: -1 });  // Sort by newest first

        // Get all student IDs from the requests
        const studentIds = requests.flatMap(req => [
            ...(req.relatedData.teamMembers || []),
            req.relatedData.studentId
        ]).filter(id => id); // Filter out any null/undefined values

        // Fetch all student details in one query
        const students = await Student.find({
            _id: { $in: studentIds }
        }).select('name studentId email');

        // Create a map for quick lookup
        const studentMap = new Map(
            students.map(s => [s._id.toString(), s])
        );

        // Transform the requests with actual student details
        const transformedRequests = requests.map(request => {
            const requestObj = request.toObject();
            
            // Transform the requesting student's details
            if (requestObj.relatedData.studentId) {
                const student = studentMap.get(requestObj.relatedData.studentId.toString());
                if (student) {
                    requestObj.relatedData.studentId = {
                        _id: student._id,
                        name: student.name,
                        studentId: student.studentId,
                        email: student.email
                    };
                }
            }

            // Transform team members' details
            requestObj.relatedData.teamMembers = (requestObj.relatedData.teamMembers || [])
                .map(memberId => {
                    const student = studentMap.get(memberId.toString());
                    return student ? {
                        _id: student._id,
                        name: student.name,
                        studentId: student.studentId
                    } : null;
                })
                .filter(member => member); // Remove any null values

            return requestObj;
        });

        res.json(transformedRequests);
    } catch (error) {
        console.error('Error fetching team requests:', error);
        res.status(500).json({ 
            message: 'Error fetching requests',
            error: error.message 
        });
    }
});

// Handle team request
instructorRoutes.put('/team-requests/:requestId/handle', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, message } = req.body;
        const instructorId = req.user.userId;

        console.log('Processing team request:', { requestId, status, instructorId });

        const request = await Notification.findById(requestId)
            .populate('relatedData.studentId')
            .populate({
                path: 'relatedData.teamMembers',
                model: 'Student'
            });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update notification status
        request.status = status;
        if (message) request.relatedData.rejectMessage = message;
        await request.save();

        if (status === 'APPROVED') {
            try {
                // Get instructor name
                const instructor = await Instructor.findById(instructorId);
                if (!instructor) {
                    throw new Error('Instructor not found');
                }

                // Convert teamMembers from strings to ObjectIds if they aren't already
                const teamMemberIds = request.relatedData.teamMembers.map(member => 
                    typeof member === 'string' ? member : member._id
                );

                // Get all team member IDs including the leader
                const allTeamMembers = [
                    request.relatedData.studentId._id,
                    ...teamMemberIds
                ];

                // Create approval notifications for all team members
                const approvalNotifications = allTeamMembers.map(memberId => ({
                    recipient: memberId,
                    recipientModel: 'Student',
                    type: 'TEAM_REQUEST_RESPONSE',
                    status: 'UNREAD',
                    message: `Your team request has been approved by ${instructor.name}`,
                    relatedData: {
                        studentId: request.relatedData.studentId._id,
                        teamMembers: request.relatedData.teamMembers,
                        instructorId: instructorId,
                        instructorName: instructor.name,
                        timestamp: request.timestamp
                    }
                }));

                // Save approval notifications
                await Notification.insertMany(approvalNotifications);

                // Rest of your existing approval logic...
                await Student.updateMany(
                    { _id: { $in: allTeamMembers } },
                    { managedBy: instructorId }
                );

                const research = await Research.findOneAndUpdate(
                    { mongoId: request.relatedData.studentId._id },
                    {
                        adviser: instructorId,
                        mongoId: request.relatedData.studentId._id,
                        teamMembers: teamMemberIds
                    },
                    { new: true, upsert: true }
                );

                // Update original request status
                await Notification.updateMany(
                    {
                        type: 'TEAM_REQUEST',
                        $and: [
                            { 
                                $or: [
                                    { 'relatedData.studentId': request.relatedData.studentId._id },
                                    { 'relatedData.teamMembers': { $in: teamMemberIds } }
                                ]
                            },
                            { 'relatedData.timestamp': request.timestamp }
                        ]
                    },
                    { status: 'APPROVED' }
                );

            } catch (updateError) {
                console.error('Error in approval updates:', updateError);
                throw updateError;
            }
        }

        if (status === 'REJECTED') {
            try {
                console.log('Processing rejection...');
                // Get instructor name
                const instructor = await Instructor.findById(instructorId);
                if (!instructor) {
                    throw new Error('Instructor not found');
                }

                // Get all team members including the leader
                const allTeamMembers = [
                    request.relatedData.studentId._id,
                    ...request.relatedData.teamMembers
                ].filter(Boolean);

                // Create rejection notifications for all team members
                const rejectionNotifications = allTeamMembers.map(memberId => ({
                    recipient: memberId,
                    recipientModel: 'Student',
                    type: 'TEAM_REQUEST_RESPONSE',
                    status: 'UNREAD',
                    message: `Your team request was rejected by ${instructor.name}${message ? ': ' + message : ''}`,
                    relatedData: {
                        studentId: request.relatedData.studentId._id,
                        teamMembers: request.relatedData.teamMembers,
                        instructorId: instructorId,
                        instructorName: instructor.name,  // Include instructor name in relatedData
                        rejectMessage: message
                    }
                }));

                // Save rejection notifications
                await Notification.insertMany(rejectionNotifications);

                // Update the original request status to REJECTED
                await Notification.updateMany(
                    {
                        type: 'TEAM_REQUEST',
                        $or: [
                            { 'relatedData.studentId': request.relatedData.studentId._id },
                            { 'relatedData.teamMembers': { $in: request.relatedData.teamMembers } }
                        ]
                    },
                    { status: 'REJECTED' }
                );

                console.log('Rejection processed successfully');
            } catch (error) {
                console.error('Error processing rejection:', error);
                throw error;
            }
        }

        res.json({ 
            success: true, 
            request,
            message: `Request ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error('Error handling team request:', error);
        res.status(500).json({ 
            message: 'Error processing request',
            error: error.message 
        });
    }
});

// Get all notifications for instructor
instructorRoutes.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        console.log('Fetching notifications for instructor:', instructorId);
        
        const notifications = await Notification.find({
            recipient: instructorId,
            recipientModel: 'Instructor'
        })
        .sort({ timestamp: -1 }); // Most recent first
        
        console.log('Found notifications:', notifications.length);
        
        // Transform notifications to ensure all data is properly formatted
        const transformedNotifications = notifications.map(notification => ({
            _id: notification._id,
            type: notification.type,
            message: notification.message,
            status: notification.status,
            timestamp: notification.timestamp,
            relatedData: notification.relatedData || {},
            recipientModel: notification.recipientModel
        }));

        console.log('Transformed notifications:', transformedNotifications);
        
        res.json(transformedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ 
            message: 'Error fetching notifications',
            error: error.message 
        });
    }
});

// Mark notification as read
instructorRoutes.put('/notifications/:id/mark-read', authenticateToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const instructorId = req.user.userId;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: instructorId,
                status: 'UNREAD'
            },
            { status: 'READ' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or already read' });
        }

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

instructorRoutes.get('/research/:studentId', authenticateToken, async (req, res) => {
  try {
    const research = await Research.findOne({
      $or: [
        { mongoId: req.params.studentId },
        { teamMembers: req.params.studentId }
      ]
    });
    res.json(research);
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json({ message: 'Error fetching research information' });
  }
});

// Add new endpoint to dissolve a team
instructorRoutes.delete('/teams/:teamId', authenticateToken, async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const teamId = req.params.teamId;

        // Find all students in the team
        const research = await Research.findOne({ mongoId: teamId });
        if (!research) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Get all team member IDs including the leader
        const allTeamMembers = [research.mongoId, ...research.teamMembers];

        // Update all team members to remove team association
        await Student.updateMany(
            { _id: { $in: allTeamMembers } },
            { 
                $unset: { 
                    managedBy: 1,
                    teamLeader: 1,
                    teamMembers: 1
                }
            }
        );

        // Delete the research document
        await Research.deleteOne({ _id: research._id });

        // Create notifications for all team members
        const notifications = allTeamMembers.map(memberId => ({
            recipient: memberId,
            recipientModel: 'Student',
            type: 'GENERAL',
            status: 'UNREAD',
            message: 'Your team has been dissolved by the instructor.',
            relatedData: {
                instructorId: instructorId
            }
        }));

        await Notification.insertMany(notifications);

        res.json({ message: 'Team dissolved successfully' });
    } catch (error) {
        console.error('Error dissolving team:', error);
        res.status(500).json({ 
            message: 'Error dissolving team',
            error: error.message 
        });
    }
});

export default instructorRoutes;
