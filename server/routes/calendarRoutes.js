import express from 'express';
import calendarService from '../services/calendarService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create calendar event
router.post('/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime, attendees } = req.body;
    const user = await user.findById(req.user.id);

    if (!user.calendarId) {
      // Create calendar for new user
      await calendarService.createUserCalendar(user._id, user.email);
    }

    const event = await calendarService.createEvent(user.calendarId, {
      title,
      description,
      startDateTime,
      endDateTime,
      attendees
    });

    res.json(event);
  } catch (error) {
    console.error('Calendar event creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's calendar events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query;
    const user = await User.findById(req.user.id);

    if (!user.calendarId) {
      return res.json([]);
    }

    const events = await calendarService.getEvents(
      user.calendarId,
      new Date(timeMin),
      new Date(timeMax)
    );

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
router.put('/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user.id);
    
    const updatedEvent = await calendarService.updateEvent(
      user.calendarId,
      eventId,
      req.body
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete calendar event
router.delete('/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.user.id);
    
    await calendarService.deleteEvent(user.calendarId, eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
