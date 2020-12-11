import { google }       from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { authorize }    from './google-auth'
import * as fs          from 'fs'

export async function summary(opts: any = {}) {
    const events = await listEvents(opts);

    // [i] https://developers.google.com/calendar/v3/reference/events
    return events.map((event:any) => ({
        summary: event.summary,
        creator: event.creator.email,
        organizer: event.organizer.email,
        colorId: event.colorId,
        date: {
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
        },
        description: event.description
    }));
}

// https://developers.google.com/calendar/quickstart/nodejs
// https://developers.google.com/calendar/v3/reference/events/list
export async function listEvents(opts: any = {}) : Promise<Array<any>> {
    const { id, limit = 10 } = opts;
    const calendar = await connect();

    return new Promise((accept, reject) => {
        calendar.events.list({
            calendarId:     id,
            timeMin:        (new Date()).toISOString(),
            maxResults:     limit,
            singleEvents:   true, // Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves. Optional. The default is False.
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

export async function singleEvent(opts: any = {}) : Promise<Array<any>> {
    const { calendarId, eventId } = opts;
    const calendar = await connect();

    return new Promise((accept, reject) => {
        calendar.events.get({
            calendarId: calendarId,
            eventId: eventId
        }, 
        (err: any, res: any) => {
            if (err) 
                reject(err);
            else
                accept(res.data);
        });
    });
}

export async function listCalendars() : Promise<Array<any>> {
    const calendar = await connect();
    
    return new Promise((accept, reject) => {
        calendar.calendarList.list({}, 
        (err: any, res: any) => {
            if (err) 
                reject(err);
            else
                accept(res.data.items);
        });
    });
}

const connect = async () => google.calendar({version: 'v3', auth: await client()});

const client = async () : Promise<OAuth2Client> => {
    const credential = JSON.parse(fs.readFileSync('.conf/credentials.json').toString());
  
    return await authorize(
      credential, 
      { tokenPath: '.conf/token.json', scopes: ['https://www.googleapis.com/auth/calendar.readonly'] });
  }