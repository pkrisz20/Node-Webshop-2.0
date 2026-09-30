const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const MS_PER_SECOND = 1000;

/** Converts the durations of the config (days, hours) to the units expected by the libraries */
export class Duration {
    static daysInSeconds(days: number): number {
        return days * SECONDS_PER_DAY;
    }

    static daysInMilliseconds(days: number): number {
        return Duration.daysInSeconds(days) * MS_PER_SECOND;
    }

    static hoursInMilliseconds(hours: number): number {
        return hours * SECONDS_PER_HOUR * MS_PER_SECOND;
    }
}
