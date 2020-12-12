import { calendar_v3, google }       from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { authorize }    from './google-auth';
import * as fs          from 'fs';

// https://developers.google.com/calendar/quickstart/nodejs
// https://developers.google.com/calendar/v3/reference/events/list
export async function listEvents(ports: Ports, opts: Options) : Promise<Array<any>> {
    const { log } = ports;

    const calendar = await connect();

    log.debug(JSON.stringify(opts));

    const dateRange: DateRange = opts.dateRange || new DateRange(new Date());

    log.info(`Calendars: <${opts.calendarIds.join(', ')}>`);
    log.info(`Date range: <${dateRange.from.toISOString()}> to <${dateRange.to?.toISOString() || 'none'}>`);

    const calendars = await getCalendars(log, opts.calendarIds);
    const calenderName = (calendarId: string) => { 
        return calendars.filter(it => it.id === calendarId)[0].summary;
    }
    const calenderColors = (calendarId: string) => { 
        const cal = calendars.filter(it => it.id === calendarId)[0];
        return {
            backgroundColor: cal.backgroundColor,
            foregroundColor: cal.foregroundColor
        }
    }

    log.debug(`Calendars: ${JSON.stringify(calendars, null, 2)}`);

    return Promise.all(
        opts.calendarIds.map(async calendarId => {
            const temp = await eventsForCalendar(ports, calendar, calendarId, dateRange);
            return temp.map((it:any) => {
                return { 
                    calendarName: calenderName(calendarId),
                    colors: calenderColors(calendarId), 
                    ...it}
            });
        })).
        then(results => [].concat.apply([], results));
}

const eventsForCalendar = (ports: Ports, calendar: calendar_v3.Calendar, calendarId:string, dateRange: DateRange) : Promise<any> => {
    const queryOptions = {
        calendarId:     calendarId,
        timeMin:        dateRange.from.toISOString(),
        timeMax:        dateRange.to?.toISOString(),
        maxResults:     10,
        singleEvents:   true, // Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves. Optional. The default is False.
        orderBy:        'startTime',
    }

    ports.log.debug(`[google-calendar-api] ${JSON.stringify(queryOptions)}`);

    return new Promise((accept, reject) => {
        calendar.events.list(queryOptions, 
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

const getCalendars = async (log: Log, calendarIds: Array<string>) : Promise<Array<any>> => {
    const calendar = await connect();
    
    log.debug(`Fetching calendars <${calendarIds.join(', ')}>`);

    return Promise.all(calendarIds.map(calendarId => {
        return new Promise((accept, reject) => {
            calendar.calendarList.get({ calendarId }, 
            (err: any, res: any) => {
                if (err) {
                    reject(err);
                } else {
                    log.debug(`Fetched calendar <${res.data}>`);
                    accept(res.data);
                }
            });
        });
    }));
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

export class DateRange {
    private _from: Date;
    private _to: Date | null;

    get from(): Date { return this._from; }
    get to(): Date | null { return this._to; }

    constructor(from: Date, to?: Date) {
        this._from = from;
        this._to = to || null;
    }

    plusDays(n: number) : DateRange {
        const toDate = new Date(this._from.getTime());
        
        toDate.setDate(toDate.getDate() + n);
        
        return new DateRange(this._from, toDate);
    }
}

export class Options {
    public calendarIds: Array<string> = [];
    public dateRange?: DateRange;
    public limit?:number = 10;
}

export interface Log {
    info(message: string): void
    debug(message: string): void
}

export class ConsoleLog implements Log {
    private _verbose: boolean = false;

    constructor(verbose: boolean = false) {
        this._verbose = verbose;
    }

    info(message: string): void {
        console.log(message);
    }

    debug(message: string): void {
        if (this._verbose) {
            console.log(`[dbg] ${message}`);
        }
    }
}

export class Ports {
    public log: Log;

    constructor(log: Log) {
        this.log = log;
    }
}