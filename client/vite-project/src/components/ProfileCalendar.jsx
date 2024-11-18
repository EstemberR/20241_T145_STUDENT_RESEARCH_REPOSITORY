import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../components/css/Calendar.css';  // Add this import

// Add styles directly in the component
const calendarStyles = {
  wrapper: {
    minHeight: '600px',
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
  },
  event: {
    backgroundColor: '#198754',
    borderColor: '#198754',
  },
};

const ProfileCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/calendar/events', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          timeMin: new Date().toISOString(),
          timeMax: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      title: '',
      description: '',
      startDateTime: selectInfo.startStr,
      endDateTime: selectInfo.endStr
    });
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/calendar/events', newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEventModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="calendar-section mt-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">My Calendar</h5>
        </div>
        <div className="card-body">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            height="auto"
            eventContent={(eventInfo) => (
              <div className="fc-event-content">
                <div className="fc-event-title">{eventInfo.event.title}</div>
                <div className="fc-event-time">
                  {new Date(eventInfo.event.start).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Event Creation Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEventSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.startDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.endDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Create Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfileCalendar; 