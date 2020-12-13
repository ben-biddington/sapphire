import { CalendarView } from "./calendar-view";

//import { CalendarView } from './calendar-view';
import * as chalk   from 'chalk'
import { DateTime } from 'luxon';

export class TextCalendarView implements CalendarView {
    show(events: Array<any>) : void {
        events.forEach(event => {
            const day = DateTime.fromISO(event.start.date || event.start.dateTime);
            console.log(
              `${chalk.bgHex(event.colors.backgroundColor).hex(event.colors.foregroundColor)(event.calendarName.padEnd(40))} ` + 
              `${chalk.bgGreen(day.toFormat('dd LLL yyyy ').padEnd(20))} ` + 
              `${event.summary}`);
          });
    }
}