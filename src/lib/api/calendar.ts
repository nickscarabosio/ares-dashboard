export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  description?: string;
  color?: string;
}

function getCalendarToken(): string {
  const token = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_TOKEN;
  if (!token) {
    throw new Error('Google Calendar token not configured in environment');
  }
  return token;
}

async function refreshCalendarToken(): Promise<string> {
  const refreshToken = process.env.NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Google OAuth credentials incomplete for token refresh');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to refresh Google token:', error);
    throw error;
  }
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    let accessToken = getCalendarToken();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      access_token: accessToken,
      timeMin: now.toISOString(),
      timeMax: sevenDaysFromNow.toISOString(),
      maxResults: '7',
      orderBy: 'startTime',
      singleEvents: 'true',
    });

    let response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.status === 401) {
      try {
        accessToken = await refreshCalendarToken();
        const retryParams = new URLSearchParams({
          access_token: accessToken,
          timeMin: now.toISOString(),
          timeMax: sevenDaysFromNow.toISOString(),
          maxResults: '7',
          orderBy: 'startTime',
          singleEvents: 'true',
        });

        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${retryParams}`,
          { headers: { 'Accept': 'application/json' } }
        );
      } catch {
        throw new Error('Calendar: Unauthorized (token expired and refresh failed)');
      }
    }

    if (response.status === 403) throw new Error('Calendar: Permission denied (insufficient scope)');
    if (response.status === 429) throw new Error('Calendar: Rate limited. Please try again later.');
    if (!response.ok) throw new Error(`Calendar: HTTP ${response.status}`);

    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((event: any) => {
      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;

      let timeStr = 'All day';
      try {
        const date = new Date(startTime);
        timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch {
        // If time parsing fails, use default
      }

      return {
        id: event.id,
        title: event.summary || 'Untitled Event',
        date: new Date(startTime).toISOString().split('T')[0],
        time: timeStr,
        endTime: endTime ? new Date(endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
        description: event.description,
        color: event.colorId,
      };
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    throw error;
  }
}

export function parseCalendarEvents(events: CalendarEvent[]) {
  return events.map(event => ({
    ...event,
    displayTime: event.time ? `${event.time}${event.endTime ? ` - ${event.endTime}` : ''}` : 'All day',
  }));
}
