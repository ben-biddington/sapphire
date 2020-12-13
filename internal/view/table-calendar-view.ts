import { CalendarView } from "./calendar-view";
import * as chalk  from 'chalk'
import { DateTime } from 'luxon';
import * as Table from 'cli-table3';

export class TableCalendarView implements CalendarView {
    show(events: Array<any>) : void {
        const table = new Table({
            head:       [ chalk.whiteBright('Calendar') , chalk.whiteBright('Date'), chalk.whiteBright('Summary')],
            colWidths:  [50         , 50    , 100]
        });

        events.forEach(event => {
            const day = DateTime.fromISO(event.start.date || event.start.dateTime);
                
            table.push([
                `${chalk.bgHex(event.colors.backgroundColor).hex(event.colors.foregroundColor)(event.calendarName)}`,
                `${day.toFormat('dd LLL yyyy ').padEnd(10)} `,
                `${event.summary}`
            ]);
        })

        console.log(table.toString());
    }
}