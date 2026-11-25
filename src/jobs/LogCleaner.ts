import { Op } from 'sequelize';
import { appConfig } from '../config/app';
import { LOG_TYPES, Log, type LogType } from '../models';
import { Duration } from '../utils/Duration';

/** Deletes the log entries older than the retention period of their type (appConfig.logs.retentionDays) */
export class LogCleaner {
    /** @returns The number of deleted entries per type */
    async clean(): Promise<Record<LogType, number>> {
        const deletedCounts = {} as Record<LogType, number>;

        for (const type of LOG_TYPES) {
            const deleteBefore = new Date(Date.now() - Duration.daysInMilliseconds(appConfig.logs.retentionDays[type]));
            deletedCounts[type] = await Log.destroy({ where: { log_type: type, log_date: { [Op.lt]: deleteBefore } } });
        }

        return deletedCounts;
    }
}
