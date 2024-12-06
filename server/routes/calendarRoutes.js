import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import Event from '../model/Event.js';

const router = express.Router();

// Get all events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const events = await Event.find({});
        const eventsWithTheme = events.map(event => ({
            ...event.toObject(),
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
        const { title, description, start, end } = req.body;
        
        const newEvent = new Event({
            title,
            start: new Date(start),
            end: new Date(end),
            extendedProps: {
                description
            }
        });

        const savedEvent = await newEvent.save();
        const eventWithTheme = {
            ...savedEvent.toObject(),
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
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
