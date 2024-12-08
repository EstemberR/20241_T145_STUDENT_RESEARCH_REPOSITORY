import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaExpandAlt, FaCompress } from 'react-icons/fa';
import "../components/css/Calendar.css";
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.response.use(
  response => response,
  error => {
    console.log('Axios Error:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    return Promise.reject(error);
  }
);

const ProfileCalendar = ({ userRole }) => {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    clickedDate: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const canModifyEvents = userRole === 'instructor';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    }
  };

  const handleDateClick = (info) => {
    if (!canModifyEvents) return;

    console.log('Clicked date:', info.dateStr);
    setNewEvent({
      ...newEvent,
      clickedDate: info.dateStr,
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00'
    });
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo) => {
    console.log('Clicked event:', clickInfo.event);
    console.log('Event ID:', clickInfo.event._def.extendedProps._id);

    setSelectedEvent({
      _id: clickInfo.event._def.extendedProps._id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      extendedProps: clickInfo.event.extendedProps
    });
    setShowViewModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const eventToAdd = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        start: `${newEvent.clickedDate}T${newEvent.startTime}`,
        end: `${newEvent.clickedDate}T${newEvent.endTime}`
      };

      console.log('Creating event:', eventToAdd);

      await axios.post('/api/events', eventToAdd, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });

      // Fetch all events again to ensure we have the latest data
      await fetchEvents();
      
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        clickedDate: null
      });
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    console.log('Selected Event for deletion:', selectedEvent);

    if (!selectedEvent?._id) {
      console.error('No event ID found:', selectedEvent);
      setError('Cannot delete event: Event ID not found');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Attempting to delete event with ID:', selectedEvent._id);

      const response = await axios.delete(`/api/events/${selectedEvent._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        }
      });

      if (response.status === 200) {
        console.log('Event deleted successfully');
        await fetchEvents(); // Refresh events after successful deletion
        setShowViewModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.message || 'Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="calendar-event-content">
        <div className="event-time">{eventInfo.timeText}</div>
        <div className="event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <div className={`calendar-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="calendar-header">
        <div className="calendar-title">
          <h5>Research Timeline</h5>
          <Button 
            variant="link" 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <FaCompress /> : <FaExpandAlt />}
          </Button>
        </div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isExpanded ? "dayGridMonth" : "dayGridWeek"}
          headerToolbar={isExpanded ? {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          } : {
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          height={isExpanded ? "80vh" : "400px"}
          events={events}
          dateClick={canModifyEvents ? handleDateClick : null}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          dayMaxEvents={false}
          eventDisplay="block"
          eventBackgroundColor="#28a745"
          eventBorderColor="#28a745"
          eventTextColor="#ffffff"
          selectable={canModifyEvents}
          editable={false}
        />
      </div>

      {/* View Event Modal - Show to everyone but with different options */}
      <Modal 
        show={showViewModal} 
        onHide={() => {
          setShowViewModal(false);
          setError(null);
        }}
        size="sm"
        centered
        className="event-detail-modal"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#28a745' }}>
          <Modal.Title style={{ width: '100%' }}>
            <div style={{ color: '#ffffff', fontWeight: 500, fontSize: '1rem' }}>
              {selectedEvent?.title}
            </div>
            <div style={{ color: '#ffffff', fontSize: '0.8rem', opacity: 0.9 }}>
              {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleDateString() : ''}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert 
              variant="danger" 
              className="py-1 px-2 mb-2" 
              style={{ 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              {error}
            </Alert>
          )}
          <div className="event-details">
            {selectedEvent?.extendedProps?.description && (
              <div className="detail-section">
                <h6 className="text-success">Description</h6>
                <p>{selectedEvent.extendedProps.description}</p>
              </div>
            )}
            <div className="detail-section">
              <h6 className="text-success">Time</h6>
              <p>
                <strong>Start:</strong> {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}<br/>
                <strong>End:</strong> {selectedEvent?.end ? new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => {
              setShowViewModal(false);
              setError(null);
            }}
          >
            Close
          </Button>
          {canModifyEvents && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleDeleteEvent}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add Event Modal - Only shown to instructors */}
      {canModifyEvents && (
        <Modal 
          show={showEventModal} 
          onHide={() => {
            setShowEventModal(false);
            setError(null);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Add Event for {newEvent.clickedDate ? new Date(newEvent.clickedDate).toLocaleDateString() : ''}
            </Modal.Title>
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
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Start Time <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>End Time <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      required
                    />
                  </Form.Group>
                </div>
              </div>

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
                  {loading ? 'Adding...' : 'Add Event'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ProfileCalendar;