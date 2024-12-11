import express from 'express';
import Student from '../model/Student.js'; 
import authenticateToken from '../middleware/authenticateToken.js';
import FAQ from '../model/FAQ.js';
import Research from '../model/Research.js';
import Instructor from '../model/Instructor.js';
import Notification from '../model/Notification.js';
import multer from 'multer';

const studentRoutes = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get profile route
studentRoutes.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const user = await Student.findById(userId)
            .select('name email role course section managedBy photoURL')
            .populate('managedBy', 'name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the user's photoURL for debugging
        console.log('User profile retrieved:', {
            userId,
            name: user.name,
            photoURL: user.photoURL
        });

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
            fileName: req.body.fileName,  // Add this line
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
        const allResearch = await Research.find({ 
            $and: [
                { 
                    $or: [
                        { mongoId: mongoId },
                        { teamMembers: mongoId }
                    ]
                },
                { title: { $exists: true, $ne: '' } } 
            ]
        });

        const latestVersions = allResearch.reduce((acc, research) => {
            const groupId = research.parentId || research._id;
            if (!acc[groupId] || acc[groupId].version < research.version) {
                acc[groupId] = research;
            }
            return acc;
        }, {});

        // Convert back to array and sort
        const research = Object.values(latestVersions)
            .sort((a, b) => b.uploadDate - a.uploadDate);
        
        console.log('Found latest research versions:', research.length);
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
            status: 'Accepted',
            archived: false 
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
        const { members } = req.body;

        // Find the current student (team leader)
        const leader = await Student.findById(studentId);
        if (!leader) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Verify this student has project members (is a team leader)
        if (!leader.projectMembers || leader.projectMembers.length === 0) {
            return res.status(403).json({ message: 'Not authorized to manage members' });
        }

        // Update project members
        leader.projectMembers = members;
        await leader.save();

        // Update removed member's references
        const removedMembers = leader.projectMembers.filter(
            memberId => !members.includes(memberId.toString())
        );

        // Clear references for removed members
        await Student.updateMany(
            { _id: { $in: removedMembers } },
            { 
                $pull: { projectMembers: leader._id },
                $unset: { instructorId: "" }
            }
        );

        // Send success response
        res.json({ 
            success: true, 
            message: 'Team members updated successfully',
            updatedMembers: leader.projectMembers
        });

    } catch (error) {
        console.error('Error managing team members:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating team members' 
        });
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
        const { teamMembers, instructorId } = req.body;
        const leaderId = req.user.userId;

        // Find the leader
        const leader = await Student.findById(leaderId);
        if (!leader) {
            return res.status(404).json({ message: 'Leader not found' });
        }

        // Update leader's projectMembers
        leader.projectMembers = teamMembers; // Add all team members
        leader.instructorId = instructorId;
        await leader.save();

        // Update each member's projectMembers to include the leader
        await Student.updateMany(
            { _id: { $in: teamMembers } },
            { 
                $addToSet: { 
                    projectMembers: leaderId,
                    instructorId: instructorId 
                }
            }
        );

        // Rest of your team creation logic...
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: 'Error creating team' });
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
        
        const student = await Student.findById(studentId)
            .populate('projectMembers')
            .populate('managedBy')
            .populate('instructorId');

        console.log('Student found:', student);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Initialize arrays if they don't exist
        if (!student.projectMembers) {
            student.projectMembers = [];
            await student.save();
        }

        const teamMembers = student.projectMembers.map(member => member.name);
        if (!teamMembers.includes(student.name)) {
            teamMembers.unshift(student.name);
        }

        console.log('Team members:', teamMembers);

        res.json({
            hasApprovedTeam: Boolean(student.managedBy),
            hasPendingRequest: false,
            instructor: student.managedBy?.name || null,
            section: student.section,
            teamMembers: teamMembers
        });

    } catch (error) {
        console.error('Error checking team status:', error);
        res.status(500).json({ message: 'Error checking team status' });
    }
});

// Get only available students (not in any team)
studentRoutes.get('/available-students', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.userId;
        
        // Find students who:
        // 1. Are not the current user
        // 2. Have no projectMembers (no group)
        // 3. Are not archived
        // 4. Have no managedBy (no instructor assigned)
        const availableStudents = await Student.find({
            _id: { $ne: studentId },
            $or: [
                { projectMembers: { $exists: false } },
                { projectMembers: { $size: 0 } },
                { projectMembers: null }
            ],
            managedBy: null,
            archived: { $ne: true }
        }).select('name studentId');

        console.log('Available students found:', availableStudents.length); // Debug log

        res.json(availableStudents);
    } catch (error) {
        console.error('Error fetching available students:', error);
        res.status(500).json({ 
            message: 'Error fetching available students',
            error: error.message 
        });
    }
});

studentRoutes.put('/resubmit-research', authenticateToken, async (req, res) => {
  try {
    const mongoId = req.user.userId;
    const { researchId, fileUrl, driveFileId, fileName, version } = req.body;

    // Find the original research
    const originalResearch = await Research.findById(researchId);
    if (!originalResearch) {
      return res.status(404).json({ message: 'Research not found' });
    }

    // Create new research document with parentId
    const newResearch = new Research({
      ...originalResearch.toObject(),
      _id: undefined,  // Let MongoDB generate a new ID
      status: 'Pending',
      fileUrl: fileUrl,
      driveFileId: driveFileId,
      fileName: fileName, 
      version: parseInt(version),
      uploadDate: new Date(),
      submittedBy: mongoId,
      parentId: originalResearch.parentId || originalResearch._id  // Link to original
    });

    const savedResearch = await newResearch.save();

    // Create notifications for team members and instructor
    const notificationPromises = [
      // Notification for submitter
      new Notification({
        recipient: mongoId,
        recipientModel: 'Student',
        type: 'RESEARCH_SUBMISSION',
        message: `You have resubmitted the research paper: "${savedResearch.title}" (Version ${version})`,
        status: 'UNREAD',
        relatedData: {
          researchId: savedResearch._id,
          title: savedResearch.title,
          version: version
        }
      }).save(),

      // Notifications for other team members
      ...savedResearch.teamMembers
        .filter(member => member._id.toString() !== mongoId.toString())
        .map(member => 
          new Notification({
            recipient: member._id,
            recipientModel: 'Student',
            type: 'RESEARCH_SUBMISSION',
            message: `Research paper "${savedResearch.title}" has been resubmitted (Version ${version})`,
            status: 'UNREAD',
            relatedData: {
              researchId: savedResearch._id,
              title: savedResearch.title,
              version: version
            }
          }).save()
        ),

      // Notification for instructor
      new Notification({
        recipient: savedResearch.adviser._id,
        recipientModel: 'Instructor',
        type: 'RESEARCH_SUBMISSION',
        message: `Revised research submitted: "${savedResearch.title}" (Version ${version})`,
        status: 'UNREAD',
        relatedData: {
          researchId: savedResearch._id,
          title: savedResearch.title,
          version: version
        }
      }).save()
    ];

    await Promise.all(notificationPromises);

    res.json({ message: 'Research resubmitted successfully', research: savedResearch });
  } catch (error) {
    console.error('Error resubmitting research:', error);
    res.status(500).json({ message: 'Error resubmitting research' });
  }
});

// Add this new route
studentRoutes.get('/research/:id/versions', authenticateToken, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    // Find the original research (parent) if this is a revision
    const parentId = research.parentId || research._id;

    // Find all versions including the original and its revisions
    const versions = await Research.find({
      $or: [
        { _id: parentId },  // Include original
        { parentId: parentId }  // Include all revisions
      ]
    })
    .sort({ version: -1, uploadDate: -1 })
    .select('version uploadDate status driveFileId note title');

    console.log('Found versions:', versions); // Debug log
    res.json(versions);
  } catch (error) {
    console.error('Error fetching research versions:', error);
    res.status(500).json({ message: 'Error fetching research versions' });
  }
});

// Get all bookmarks for a student
studentRoutes.get('/bookmarks', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findById(req.user.userId)
            .populate('bookmarks');
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            bookmarks: student.bookmarks || []
        });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarks'
        });
    }
});

// Toggle bookmark for a research
studentRoutes.post('/bookmark/:researchId', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findById(req.user.userId);
        const research = await Research.findById(req.params.researchId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (!research) {
            return res.status(404).json({
                success: false,
                message: 'Research not found'
            });
        }

        // Initialize bookmarks array if it doesn't exist
        if (!student.bookmarks) {
            student.bookmarks = [];
        }

        // Check if research is already bookmarked
        const bookmarkIndex = student.bookmarks.indexOf(req.params.researchId);
        
        if (bookmarkIndex === -1) {
            // Add bookmark
            student.bookmarks.push(req.params.researchId);
            await student.save();
            
            res.status(200).json({
                success: true,
                message: 'Research bookmarked successfully',
                isBookmarked: true
            });
        } else {
            // Remove bookmark
            student.bookmarks.splice(bookmarkIndex, 1);
            await student.save();
            
            res.status(200).json({
                success: true,
                message: 'Bookmark removed successfully',
                isBookmarked: false
            });
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling bookmark'
        });
    }
});

studentRoutes.post('/remove-team-member', authenticateToken, async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { memberToRemove } = req.body;

    console.log('Starting removal process:', { leaderId, memberToRemove });

    // Find the leader
    const leader = await Student.findById(leaderId);
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }
    console.log('Leader found:', leader.name);

    // Find the member to remove
    const memberDoc = await Student.findOne({ name: memberToRemove });
    if (!memberDoc) {
      return res.status(404).json({ message: 'Member not found' });
    }
    console.log('Member found:', memberDoc.name);

    // Initialize projectMembers array if it doesn't exist
    if (!leader.projectMembers) {
      leader.projectMembers = [];
    }

    // Remove member from leader's projectMembers
    leader.projectMembers = leader.projectMembers.filter(
      memberId => memberId.toString() !== memberDoc._id.toString()
    );
    await leader.save();
    console.log('Updated leader projectMembers:', leader.projectMembers);

    // Remove leader from member's projectMembers
    if (!memberDoc.projectMembers) {
      memberDoc.projectMembers = [];
    }
    memberDoc.projectMembers = memberDoc.projectMembers.filter(
      id => id.toString() !== leader._id.toString()
    );
    memberDoc.instructorId = null;
    memberDoc.managedBy = null;
    await memberDoc.save();
    console.log('Updated member projectMembers:', memberDoc.projectMembers);

    // Update Research document if it exists
    await Research.updateOne(
      { mongoId: leaderId },
      { $pull: { teamMembers: memberDoc._id } }
    );

    // Fetch updated team data
    const updatedLeader = await Student.findById(leaderId)
      .populate('projectMembers')
      .populate('managedBy');

    const updatedTeamMembers = updatedLeader.projectMembers.map(member => member.name);
    if (!updatedTeamMembers.includes(updatedLeader.name)) {
      updatedTeamMembers.unshift(updatedLeader.name);
    }

    res.json({
      success: true,
      message: 'Team member removed successfully',
      teamMembers: updatedTeamMembers
    });

  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message
    });
  }
});

// Add member route
studentRoutes.post('/add-team-member', authenticateToken, async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { newMemberId } = req.body;

    // Find the leader and their current team
    const leader = await Student.findById(leaderId)
      .populate('managedBy')
      .populate('instructorId');
    
    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Find the new member
    const newMember = await Student.findById(newMemberId);
    if (!newMember) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if team size is within limits
    if (leader.projectMembers && leader.projectMembers.length >= 4) {
      return res.status(400).json({ message: 'Maximum team size reached' });
    }

    // Initialize projectMembers array if it doesn't exist
    if (!leader.projectMembers) {
      leader.projectMembers = [];
    }

    // Add member to leader's projectMembers if not already there
    if (!leader.projectMembers.includes(newMemberId)) {
      leader.projectMembers.push(newMemberId);
      await leader.save();
    }

    // Update the new member
    await Student.findByIdAndUpdate(newMemberId, {
      $addToSet: { projectMembers: leaderId },
      instructorId: leader.instructorId,
      managedBy: leader.managedBy
    });

    // Update Research document if it exists
    await Research.updateOne(
      { mongoId: leaderId },
      { $addToSet: { teamMembers: newMemberId } }
    );

    // Get updated team data
    const updatedLeader = await Student.findById(leaderId)
      .populate('projectMembers')
      .populate('managedBy');

    res.json({
      success: true,
      message: 'Team member added successfully',
      teamMembers: updatedLeader.projectMembers.map(member => member.name)
    });

  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding team member',
      error: error.message
    });
  }
});

export default studentRoutes;
