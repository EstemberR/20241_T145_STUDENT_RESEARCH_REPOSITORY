import { google } from 'googleapis';
import dotenv from 'dotenv';

class CalendarService {
  constructor() {
    this.credentials = {
      type: 'service_account',
      project_id: process.env.MY_CALENDAR_PROJECT_ID,
      private_key_id: process.env.MY_CALENDAR_PRIVATE_KEY_ID,
      private_key: process.env.MY_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.MY_CALEDNDAR_CLIENT_EMAIL,
      client_id: process.env.MY_CLIENT_ID,
      auth_uri: process.env.MY_ACALENDAR_UTH_URI,
      token_uri: process.env.MY_CALENDAR_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.MY_CALENDAR_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.MY_CALENDAR_CLIENT_X509_CERT_URL,
      universe_domain: process.env.MY_CALENDAR_UNIVERSE_DOMAIN
    };

    this.auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  // Create a calendar for a new user
  async createUserCalendar(userId, userEmail) {
    try {
      const calendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: `SRRS Calendar - ${userEmail}`,
          timeZone: 'Asia/Manila'
        }
      });

      // Store the calendar ID in your user's database record
      await User.findByIdAndUpdate(userId, {
        calendarId: calendar.data.id
      });

      // Share calendar with the user
      await this.calendar.acl.insert({
        calendarId: calendar.data.id,
        requestBody: {
          role: 'writer',
          scope: {
            type: 'user',
            value: userEmail
          }
        }
      });

      return calendar.data.id;
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw error;
    }
  }

  // Create an event
  async createEvent(calendarId, eventDetails) {
    try {
      const event = {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startDateTime,
          timeZone: 'Asia/Manila',
        },
        end: {
          dateTime: eventDetails.endDateTime,
          timeZone: 'Asia/Manila',
        },
        attendees: eventDetails.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Get events for a calendar
  async getEvents(calendarId, timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Update an event
  async updateEvent(calendarId, eventId, eventDetails) {
    try {
      const response = await this.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: {
          summary: eventDetails.title,
          description: eventDetails.description,
          start: {
            dateTime: eventDetails.startDateTime,
            timeZone: 'Asia/Manila',
          },
          end: {
            dateTime: eventDetails.endDateTime,
            timeZone: 'Asia/Manila',
          },
        },
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(calendarId, eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
        sendUpdates: 'all'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export default new CalendarService(); 