
import * as fs          from 'fs'
import { listEvents, summary, singleEvent }   from './internal/google-calendar'
import { authorize }    from './internal/google-auth'
import { Command }      from 'commander'
//import * as chalk                 from 'chalk'

const program = new Command();

program.
  version('0.0.1').
  command("info [calendarId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId, cmd) => {
    console.log(`Querying for calendar <${calendarId}>`);

    const credential = JSON.parse(fs.readFileSync('.conf/credentials.json').toString());

    const token = await authorize(
        credential, 
        { tokenPath: '.conf/token.json', scopes: ['https://www.googleapis.com/auth/calendar.readonly'] }); 

    return listEvents(token, {id: calendarId}).then(console.log);
  });

program.
  command("summary [calendarId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId, cmd) => {
    console.log(`Querying for calendar <${calendarId}>`);

    const credential = JSON.parse(fs.readFileSync('.conf/credentials.json').toString());

    const token = await authorize(
        credential, 
        { tokenPath: '.conf/token.json', scopes: ['https://www.googleapis.com/auth/calendar.readonly'] }); 

    return summary(token, {id: calendarId}).then(console.log);
  });

program.
  command("event [calendarId] [eventId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId, eventId, cmd) => {
    console.log(`Querying for calendar <${calendarId}>`);

    const credential = JSON.parse(fs.readFileSync('.conf/credentials.json').toString());

    const token = await authorize(
        credential, 
        { tokenPath: '.conf/token.json', scopes: ['https://www.googleapis.com/auth/calendar.readonly'] }); 

    return singleEvent(token, { calendarId, eventId }).then(console.log);
  });

program.parse(process.argv);