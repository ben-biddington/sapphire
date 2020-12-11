import { google } from 'googleapis';

export async function summary(auth: any, opts: any = {}) {
    const events = await listEvents(auth, opts);

    // [i] https://developers.google.com/calendar/v3/reference/events
    return events.map((event:any) => ({
        sumary: event.summary,
        creator: event.creator.email,
        organizer: event.organizer.email,
        colorId: event.colorId,
    }));
}

// https://developers.google.com/calendar/quickstart/nodejs
export function listEvents(auth: any, opts: any = {}) : Promise<Array<any>> {
    const { id, limit = 10 } = opts;
    const calendar = google.calendar({version: 'v3', auth});

    return new Promise((accept, reject) => {
        calendar.events.list({
            calendarId:     id,
            timeMin:        (new Date()).toISOString(),
            maxResults:     limit,
            singleEvents:   true,
            orderBy:        'startTime',
        }, 
        (err: any, res: any) => {
            if (err) 
                reject(err);
            else
                accept(res.data.items);
        });
    });
}