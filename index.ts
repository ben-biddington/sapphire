
import { 
  listEvents, 
  listCalendars, 
  DateRange,
  Options, 
  Ports, 
  ConsoleLog 
}                   from './internal/google-calendar'
import { Command }  from 'commander'
import * as chalk   from 'chalk'
import { DateTime } from 'luxon'; // https://moment.github.io/luxon/docs/manual/formatting.html
const program = new Command();

program.
    command("events [calendarId]").
    option("-d --days <days>"     , "The number of days to show events for").
    option("--from <date>"        , "The start date").
    option("--to <date>"          , "The end date").
    option("-v --verbose"         , "Verbose output").
    option("--dry"                , "Dry run").
    action(async (calendarId, cmd) => {
      
      const log = new ConsoleLog(cmd.verbose);

      const opts: Options = { calendarId };

      if (cmd.days) {
        opts.dateRange = new DateRange(new Date()).plusDays(parseInt(cmd.days));
      } else if (cmd.from || cmd.to) {
        const fromDate = cmd.from ? new Date(Date.parse(cmd.from)) : new Date();
        const toDate = cmd.to ? new Date(Date.parse(cmd.to)) : new Date();
        opts.dateRange = new DateRange(fromDate, toDate);
      }

      log.debug(`command line args: days=<${cmd.days}>, from=<${cmd.from}>, to=<${cmd.to}>`);
      log.debug(`opts: ${JSON.stringify(opts)}`);

      if (! cmd.dry) {
        const events = await listEvents(new Ports(log), opts);

        log.debug(JSON.stringify(events, null, 2));

        events.forEach(event => {
          const day = DateTime.fromISO(event.start.date || event.start.dateTime);
          console.log(`${chalk.bgGreen(day.toFormat('dd LLL yyyy ').padEnd(20))} ${event.summary}`);
        });

      } else {
        log.info(`Dry run is on, exiting`);
      }
    });

program.
  command("calendars").
  description("List all calendars").
  option("-v --verbose", "Verbose output").
  action(async cmd => {
    const log = new ConsoleLog(cmd.verbose);
    
    const list = await listCalendars();

    log.debug(JSON.stringify(list, null, 2));

    const columnLength = Math.max(...list.map(it => it.summary.length)); 

    list.forEach(calendar => {
      console.log(
        `${chalk.bgHex(calendar.backgroundColor).hex(calendar.foregroundColor)(calendar.summary.padEnd(columnLength + 5, ' '))} -- ` +
        `${chalk.green(calendar.id)}`);
    });
  });

program.parse(process.argv);