
import { listEvents, listCalendars, DateRange, Options } from './internal/google-calendar'
import { Command }      from 'commander'
//import * as chalk                 from 'chalk'

const program = new Command();

program.
    command("events [calendarId]").
    option("-d --days <days>", "The number of days to show events for").
    action(async (calendarId, cmd) => {
      
      const opts: Options = {calendarId};

      if (cmd.days) {
        opts.dateRange = new DateRange(new Date()).plusDays(parseInt(cmd.days))
      }

      listEvents(opts).then(console.log)
    });

program.
  command("calendars").
  action(async () => listCalendars().then(console.log));

program.parse(process.argv);