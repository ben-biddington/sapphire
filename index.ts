
import { listEvents, summary, singleEvent, listCalendars } from './internal/google-calendar'
import { Command }      from 'commander'
//import * as chalk                 from 'chalk'

const program = new Command();

program.
  version('0.0.1').
  command("info [calendarId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId) => 
    listEvents({id: calendarId}).then(console.log));

program.
  command("summary [calendarId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId) => 
    summary({id: calendarId}).then(console.log));

program.
  command("event [calendarId] [eventId]").
  option("-v --verbose", "Enable verbose logging").
  action(async (calendarId, eventId, cmd) => 
    singleEvent({ calendarId, eventId }).then(console.log));

program.
  command("calendars").
  action(async () => listCalendars().then(console.log));

program.parse(process.argv);