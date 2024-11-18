import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button, Form, Badge, Alert } from "react-bootstrap";
import "../components/css/Calendar.css";

const ProfileCalendar = () => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    type: 'research',
    priority: 'medium'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const eventColors = {
    research: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      textColor: '#ffffff'
    },
    deadline: {
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      textColor: '#ffffff'
    },
    meeting: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
      textColor: '#ffffff'
    },
    other: {
      backgroundColor: '#6c757d',
      borderColor: '#6c757d',
      textColor: '#ffffff'
    }
  };

  // Handle date selection
  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    // Format dates for datetime-local input
    const formatDateForInput = (date) => {
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    };

    setNewEvent({
      ...newEvent,
      startDateTime: formatDateForInput(startDate),
      endDateTime: formatDateForInput(endDate)
    });
    setShowEventModal(true);
  };

  // Handle event click
  const handleEventClick = (clickInfo) => {
    // You can add event editing/viewing functionality here
    alert(`Event: ${clickInfo.event.title}`);
  };

  // Validate event data
  const validateEvent = (event) => {
    if (!event.title.trim()) {
      throw new Error('Event title is required');
    }

    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date/time');
    }

    if (isNaN(end.getTime())) {
      throw new Error('Invalid end date/time');
    }

    if (start >= end) {
      throw new Error('End time must be after start time');
    }

    if (start < new Date()) {
      throw new Error('Cannot create events in the past');
    }
  };

  // Handle form submission
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate event data
      validateEvent(newEvent);

      const eventToAdd = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        start: newEvent.startDateTime,
        end: newEvent.endDateTime,
        backgroundColor: eventColors[newEvent.type].backgroundColor,
        borderColor: eventColors[newEvent.type].borderColor,
        textColor: eventColors[newEvent.type].textColor,
        extendedProps: {
          type: newEvent.type,
          priority: newEvent.priority
        }
      };

      // Add event to state
      setEvents([...events, eventToAdd]);
      
      // Reset form and close modal
      setNewEvent({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        type: 'research',
        priority: 'medium'
      });
      setShowEventModal(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom event rendering
  const renderEventContent = (eventInfo) => {
    return (
      <div className={`event-content event-${eventInfo.event.extendedProps.type}`}>
        <div className="event-title">
          {eventInfo.timeText && <span className="event-time">{eventInfo.timeText}</span>}
          <span className="event-name">{eventInfo.event.title}</span>
        </div>
        {eventInfo.event.extendedProps.priority === 'high' && (
          <span className="priority-indicator">⚡</span>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
     

      <div className="calendar-wrapper">
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
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          dayMaxEvents={true}
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:00',
            endTime: '17:00',
          }}
          slotMinTime="08:00:00"
          slotMaxTime="17:00:00"
        />
      </div>

      <Modal 
        show={showEventModal} 
        onHide={() => {
          setShowEventModal(false);
          setError(null);
        }}
        className="calendar-modal"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleEventSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
                isInvalid={error && !newEvent.title.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Title is required
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date & Time <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.startDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date & Time <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="datetime-local"
                value={newEvent.endDateTime}
                onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                required
                min={newEvent.startDateTime}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                <option value="research">Revision</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={newEvent.priority}
                onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEventModal(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfileCalendar; 