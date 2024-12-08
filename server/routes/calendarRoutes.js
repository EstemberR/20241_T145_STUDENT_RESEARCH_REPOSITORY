import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Event from '../model/Event.js';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import Notification from '../model/Notification.js'; // Added import for Notification model

const router = express.Router();

// Get all events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.headers['x-user-role'] || req.user.role;

        let events;
        
        if (userRole === 'instructor') {
            // Instructors can see all events they created
            events = await Event.find({ createdBy: userId })
                .populate('createdBy')
                .sort({ start: 1 }); // Sort by start date ascending
        } else if (userRole === 'student') {
            // Get student and check for approved instructor relationship
            const student = await Student.findById(userId);
            console.log('Student:', student); // Debug log

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            // Check if student has an assigned instructor
            if (!student.managedBy) {
                console.log('No instructor assigned'); // Debug log
                events = []; // Return empty array if student has no instructor
            } else {
                // Check if there's an approved notification for this student-instructor relationship
                const approvedNotification = await Notification.findOne({
                    'relatedData.studentId': userId,
                    'relatedData.instructorId': student.managedBy,
                    type: 'TEAM_REQUEST',
                    status: 'APPROVED'
                });

                if (!approvedNotification) {
                    console.log('No approved relationship found'); // Debug log
                    events = []; // Return empty if not approved
                } else {
                    console.log('Approved relationship found, getting events'); // Debug log
                    // Show events created by the student's approved instructor
                    events = await Event.find({ 
                        createdBy: student.managedBy 
                    })
                    .populate('createdBy')
                    .sort({ start: 1 }); // Sort by start date ascending
                    console.log('Found events:', events); // Debug log
                }
            }
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        const eventsWithTheme = events.map(event => ({
            ...event.toObject(),
            _id: event._id, // Ensure _id is included
            backgroundColor: '#28a745',
            borderColor: '#28a745',
            textColor: '#ffffff'
        }));
        res.json(eventsWithTheme);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new event
router.post('/events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.headers['x-user-role'] || req.user.role;

        // Only instructors can create events
        if (userRole !== 'instructor') {
            return res.status(403).json({ message: 'Only instructors can create events' });
        }

        const { title, description, start, end } = req.body;
        
        const newEvent = new Event({
            title,
            start: new Date(start),
            end: new Date(end),
            createdBy: userId,
            extendedProps: {
                description
            }
        });

        const savedEvent = await newEvent.save();
        const populatedEvent = await Event.findById(savedEvent._id).populate('createdBy');
        
        const eventWithTheme = {
            ...populatedEvent.toObject(),
            _id: populatedEvent._id, // Ensure _id is included
            backgroundColor: '#28a745',
            borderColor: '#28a745',
            textColor: '#ffffff'
        };
        res.status(201).json(eventWithTheme);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete an event
router.delete('/events/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.headers['x-user-role'] || req.user.role;

        // Only instructors can delete events
        if (userRole !== 'instructor') {
            return res.status(403).json({ message: 'Only instructors can delete events' });
        }

        // Check if the event exists and was created by this instructor
        const event = await Event.findOne({
            _id: req.params.id,
            createdBy: userId
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found or unauthorized to delete' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
