import * as Calendar from 'expo-calendar';

export const requestCalendarPermission = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    console.log('Permission status:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permission:', error);
    return false;
  }
};

export const fetchCalendarEvents = async (startDate, endDate) => {
  try {
    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    if (calendars.length === 0) {
      console.log('No calendars found');
      return [];
    }

    // Get events from all calendars
    const allEvents = [];
    for (const calendar of calendars) {
      try {
        const events = await Calendar.getEventsAsync(
          [calendar.id],
          new Date(startDate),
          new Date(endDate)
        );
        allEvents.push(...events);
      } catch (error) {
        console.error(`Error fetching events from calendar ${calendar.title}:`, error);
      }
    }

    console.log('Fetched events:', allEvents);
    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

export const getCalendarList = async () => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    console.log('Available calendars:', calendars);
    return calendars;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return [];
  }
};